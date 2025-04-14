import React, { useState, useEffect, useRef, useCallback } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { v4 as uuidv4 } from "uuid";
import { debounce } from "lodash";
import useMeasure from "react-use-measure";
import Header from "../Header/Header";
import ConfirmationModal from "../Modal/ConfirmationModal";
import Loading from "../Loading/Loading";
import Charts from "../Charts/Charts";
import Controls from "../Controls/Controls";
import { getDefaultTitle, breakpoints, cols } from "../../utils/utils";
import styles from "./Dashboard.module.css";
import { toast } from "react-hot-toast";
import {
  sampleLineData,
  sampleBarData,
  sampleSparklineData,
  sampleSpiralData,
  defaultInitialLayout,
} from "../../data/data";
import { db } from "../../config/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
const ResponsiveGridLayout = WidthProvider(Responsive);

const normalizeLayoutItem = (item) => {
  if (!item || typeof item !== "object" || !item.i) {
    return null;
  }
  return {
    ...item,
    x: item.x ?? 0,
    y: item.y ?? 0,
    w: item.w ?? 1,
    h: item.h ?? 1,
    content: item.content || {},
  };
};

const normalizeLayoutsObject = (layoutsObj) => {
  const normalized = {};
  normalized.lg = layoutsObj.lg || defaultInitialLayout || [];

  for (const bp in layoutsObj) {
    if (
      Object.hasOwnProperty.call(layoutsObj, bp) &&
      Array.isArray(layoutsObj[bp])
    ) {
      normalized[bp] = layoutsObj[bp]
        .map(normalizeLayoutItem)
        .filter((item) => item !== null);
    } else if (!normalized[bp] && bp !== "lg") {
      normalized[bp] = [];
    }
  }
  Object.keys(breakpoints).forEach((bp) => {
    if (!normalized[bp]) {
      normalized[bp] = (normalized.lg || []).map((item) => ({ ...item }));
    }
  });

  return normalized;
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [layouts, setLayouts] = useState(null);
  const [isLoadingLayout, setIsLoadingLayout] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [blockToDeleteId, setBlockToDeleteId] = useState(null);
  const [blockToDeleteTitle, setBlockToDeleteTitle] = useState("");

  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editInputValue, setEditInputValue] = useState("");
  const editInputRef = useRef(null);
  const [measureRef, bounds] = useMeasure();
  const [containerWidth, setContainerWidth] = useState(0);
  const fileInputRef = useRef(null);

  const debouncedSaveLayout = useCallback(
    debounce(async (userId, layoutsToSave) => {
      if (!userId || !layoutsToSave) {
        console.warn("Save aborted: Missing userId or layout data.");
        return;
      }

      let foundExplicitUndefined = false;
      let checkPath = "";
      outerLoop: for (const bp in layoutsToSave) {
        if (Array.isArray(layoutsToSave[bp])) {
          for (let i = 0; i < layoutsToSave[bp].length; i++) {
            const item = layoutsToSave[bp][i];
            if (!item || !item.i) {
              console.error(`Save check: Invalid item at ${bp}[${i}]`);
              foundExplicitUndefined = true;
              checkPath = `${bp}[${i}]`;
              break outerLoop;
            }
            if (item.content) {
              for (const key in item.content) {
                if (item.content[key] === undefined) {
                  console.error(
                    `Save check: Undefined content key '${key}' in item ${item.i}`
                  );
                  foundExplicitUndefined = true;
                  checkPath = `${bp}[${i}].content.${key}`;
                  break outerLoop;
                }
              }
            } else if (item.content === undefined) {
              console.error(
                `Save check: Content object itself is undefined for item ${item.i}`
              );
              foundExplicitUndefined = true;
              checkPath = `${bp}[${i}].content`;
              break outerLoop;
            }
          }
        }
      }

      if (foundExplicitUndefined) {
        console.error(
          `SAVE ABORTED due to explicit undefined found (approx path: ${checkPath}). Data not saved.`,
          layoutsToSave
        );
        return;
      }

      try {
        const userLayoutDocRef = doc(db, "dashboards", currentUser.uid);
        const dataToSave = { layouts: layoutsToSave };
        await setDoc(userLayoutDocRef, dataToSave);
      } catch (error) {
        console.error("Error saving layout to Firestore:", error);
        console.error(
          "Object that failed to save:",
          JSON.stringify(layoutsToSave, null, 2)
        );
      }
    }, 1500),
    [currentUser, db]
  );

  useEffect(() => {
    const loadLayout = async () => {
      if (!currentUser) {
        setIsLoadingLayout(false);
        setLayouts(normalizeLayoutsObject({ lg: defaultInitialLayout || [] }));
        return;
      }

      setIsLoadingLayout(true);
      const userLayoutDocRef = doc(db, "dashboards", currentUser.uid);
      try {
        const docSnap = await getDoc(userLayoutDocRef);
        let finalLayouts;

        if (docSnap.exists()) {
          const loadedData = docSnap.data();
          if (
            loadedData &&
            typeof loadedData.layouts === "object" &&
            loadedData.layouts !== null
          ) {
            finalLayouts = normalizeLayoutsObject(loadedData.layouts);
          } else {
            console.warn(
              "Loaded Firestore data missing 'layouts' object or invalid, using default."
            );
            finalLayouts = normalizeLayoutsObject({
              lg: defaultInitialLayout || [],
            });
          }
        } else {
          const initialLayout = { lg: defaultInitialLayout || [] };
          finalLayouts = normalizeLayoutsObject(initialLayout);
          await setDoc(userLayoutDocRef, { layouts: finalLayouts });
        }
        setLayouts(finalLayouts);
      } catch (error) {
        console.error("Error loading/processing layout from Firestore:", error);
        setLayouts(normalizeLayoutsObject({ lg: defaultInitialLayout || [] }));
      } finally {
        setIsLoadingLayout(false);
      }
    };

    loadLayout();
  }, [currentUser, db]);

  const updateAndSaveLayouts = useCallback(
    (updateFn) => {
      if (layouts === null) {
        console.warn("Attempted to update layouts before initialization.");
        return;
      }

      setLayouts((prevLayouts) => {
        const newLayouts = updateFn(prevLayouts);

        if (typeof newLayouts !== "object" || newLayouts === null) {
          console.error(
            "Update function did not return a valid layouts object. Aborting state update and save.",
            newLayouts
          );
          return prevLayouts;
        }

        if (currentUser) {
          debouncedSaveLayout(currentUser.uid, newLayouts);
        } else {
          console.warn("No current user found when trying to save layout.");
        }
        return newLayouts;
      });
    },
    [currentUser, debouncedSaveLayout, layouts]
  );
  const addBlock = useCallback(
    (type, options = {}) => {
      updateAndSaveLayouts((prevLayouts) => {
        const newLayouts = { ...prevLayouts };
        const newId = uuidv4();
        let content = { type: type, title: getDefaultTitle(type, options) };
        let blockWidth = 4,
          blockHeight = 2;
        if (type === "chart") {
          content.chartType = options.chartType || "line";
          switch (content.chartType) {
            case "bar":
              content.data = sampleBarData;
              blockWidth = 6;
              blockHeight = 3;
              break;
            case "sparkline":
              content.data = sampleSparklineData;
              blockWidth = 3;
              blockHeight = 1;
              break;
            case "spiral":
              content.data = sampleSpiralData;
              blockWidth = 4;
              blockHeight = 3;
              break;
            case "line":
            default:
              content.data = sampleLineData;
              blockWidth = 4;
              blockHeight = 2;
              break;
          }
          if (typeof content.data === "undefined") {
            console.error(
              `Sample data for chart type '${content.chartType}' is undefined. Assigning empty array.`
            );
            content.data = [];
          }
        } else if (type === "image") {
          if (!options.src) {
            console.error("Source needed!");
            return prevLayouts;
          }
          content.src = options.src;
          blockWidth = 4;
          blockHeight = 3;
        } else if (type === "text") {
          content.text =
            options.text || `New Text Block ${newId.substring(0, 4)}`;
          blockWidth = 3;
          blockHeight = 1;
        } else {
          console.warn("Unknown block type:", type);
          return prevLayouts;
        }

        const newItemCore = {
          i: newId,
          w: blockWidth,
          h: blockHeight,
          x: 0,
          y: Infinity,
          content: content,
        };

        for (const breakpoint in newLayouts) {
          if (Object.hasOwnProperty.call(newLayouts, breakpoint)) {
            const currentBreakpointLayout = newLayouts[breakpoint] || [];
            const validItems = currentBreakpointLayout.filter(
              (item) => item && item.i
            );
            const newItemLayout = {
              ...newItemCore,
              x:
                validItems.reduce(
                  (max, item) => Math.max(item.x + item.w, max),
                  0
                ) % (cols[breakpoint] || 12),
              y: Infinity,
            };
            newLayouts[breakpoint] = [...validItems, newItemLayout];
          }
        }
        const title = content.title || blockTypeName || "Block";
        toast.success(`${title} added successfully!`);

        return newLayouts;
      });
    },
    [updateAndSaveLayouts, getDefaultTitle, cols]
  );

  const deleteBlock = useCallback(
    (idToDelete) => {
      updateAndSaveLayouts((prevLayouts) => {
        const newLayouts = { ...prevLayouts };
        for (const breakpoint in newLayouts) {
          if (
            Object.hasOwnProperty.call(newLayouts, breakpoint) &&
            Array.isArray(newLayouts[breakpoint])
          ) {
            newLayouts[breakpoint] = newLayouts[breakpoint].filter(
              (item) => item && item.i !== idToDelete
            );
          }
        }
        if (editingTitleId === idToDelete) {
          setEditingTitleId(null);
          setEditInputValue("");
        }
        return newLayouts;
      });
    },
    [updateAndSaveLayouts, editingTitleId]
  );
  const handleDeleteRequest = useCallback((item) => {
    if (!item || !item.i) return;
    setBlockToDeleteId(item.i);
    setBlockToDeleteTitle(
      item.content?.title || `Block ${item.i.substring(0, 4)}...`
    );
    setIsDeleteModalOpen(true);
  }, []);
  const handleConfirmDelete = useCallback(() => {
    if (blockToDeleteId) {
      deleteBlock(blockToDeleteId);
      toast.success(`Block deleted successfully!`);
    } else {
      console.error("Attempted to confirm delete with no block ID set.");
    }
    setBlockToDeleteId(null);
    setBlockToDeleteTitle("");
  }, [blockToDeleteId, deleteBlock]);

  const saveTitle = useCallback(
    (itemId) => {
      updateAndSaveLayouts((prevLayouts) => {
        const newLayouts = { ...prevLayouts };
        const trimmedTitle = editInputValue.trim();

        for (const breakpoint in newLayouts) {
          if (
            Object.hasOwnProperty.call(newLayouts, breakpoint) &&
            Array.isArray(newLayouts[breakpoint])
          ) {
            newLayouts[breakpoint] = newLayouts[breakpoint].map((item) => {
              if (item && item.i === itemId) {
                const currentContent = item.content || {};
                const newTitle =
                  trimmedTitle ||
                  getDefaultTitle(currentContent.type, currentContent);
                return {
                  ...item,
                  content: { ...currentContent, title: newTitle },
                };
              }
              return item;
            });
          }
        }
        return newLayouts;
      });
      setEditingTitleId(null);
      setEditInputValue("");
    },
    [updateAndSaveLayouts, editInputValue, getDefaultTitle]
  );
  const handleTitleClick = useCallback((item) => {
    if (item && item.content) {
      setEditingTitleId(item.i);
      setEditInputValue(item.content.title || "");
    } else {
      console.warn("Clicked item has no content:", item);
    }
  }, []);
  const handleTitleChange = useCallback((event) => {
    setEditInputValue(event.target.value);
  }, []);
  const handleTitleKeyDown = useCallback(
    (event, itemId) => {
      if (event.key === "Enter") {
        saveTitle(itemId);
      } else if (event.key === "Escape") {
        setEditingTitleId(null);
        setEditInputValue("");
      }
    },
    [saveTitle]
  );
  const handleTitleBlur = useCallback(
    (itemId) => {
      if (editingTitleId === itemId) {
        saveTitle(itemId);
      }
    },
    [editingTitleId, saveTitle]
  );
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            addBlock("image", { src: reader.result });
          } else {
            console.error("FileReader result is not a string:", reader.result);
          }
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
        };
        reader.readAsDataURL(file);
      }
      if (event.target) {
        event.target.value = null;
      }
    },
    [addBlock]
  );
  const handleLayoutChange = useCallback(
    (currentLayout, allLayouts) => {
      if (!layouts || typeof layouts !== "object") {
        console.warn("handleLayoutChange called before layouts initialized.");
        return;
      }

      setLayouts((prevLayouts) => {
        const newLayoutsState = { ...prevLayouts };
        for (const breakpoint in allLayouts) {
          if (Object.hasOwnProperty.call(allLayouts, breakpoint)) {
            const breakpointLayoutFromRGL = allLayouts[breakpoint];
            const prevBreakpointLayout = prevLayouts[breakpoint] || [];
            newLayoutsState[breakpoint] = breakpointLayoutFromRGL.map(
              (newItemFromRGL) => {
                let existingItemData = prevBreakpointLayout.find(
                  (item) => item && item.i === newItemFromRGL.i
                );
                if (!existingItemData) {
                  const lgItem = (prevLayouts.lg || []).find(
                    (item) => item && item.i === newItemFromRGL.i
                  );
                  if (lgItem) {
                    existingItemData = lgItem;
                  }
                }
                if (!existingItemData) {
                  console.warn(
                    `Could not find existing data for item ${newItemFromRGL.i} during layout change.`
                  );
                  return { ...newItemFromRGL, content: {} };
                }
                const mergedItem = {
                  ...existingItemData,
                  ...newItemFromRGL,
                  content: existingItemData.content || {},
                };
                Object.keys(mergedItem).forEach((key) => {
                  if (mergedItem[key] === undefined) delete mergedItem[key];
                });
                return mergedItem;
              }
            );
          }
        }

        if (currentUser) {
          debouncedSaveLayout(currentUser.uid, newLayoutsState);
        }
        return newLayoutsState;
      });
    },
    [layouts, currentUser, debouncedSaveLayout]
  );
  useEffect(() => {
    if (bounds.width > 0) {
      setContainerWidth(bounds.width);
    }
  }, [bounds.width]);

  useEffect(() => {
    if (editingTitleId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTitleId]);

  const getCurrentBreakpoint = useCallback(() => {
    const width = containerWidth;
    let breakpoint = "lg";
    const sortedBreakpoints = Object.keys(breakpoints).sort(
      (a, b) => breakpoints[a] - breakpoints[b]
    );
    for (const bp of sortedBreakpoints) {
      if (width >= breakpoints[bp]) {
        breakpoint = bp;
      } else {
        break;
      }
    }
    return breakpoint;
  }, [containerWidth, breakpoints]);
  if (isLoadingLayout || !layouts) {
    return <Loading message="Loading Dashboard..." />;
  }

  const currentBreakpoint = getCurrentBreakpoint();
  const layoutToRender =
    layouts && Array.isArray(layouts[currentBreakpoint])
      ? layouts[currentBreakpoint]
      : layouts && Array.isArray(layouts.lg)
      ? layouts.lg
      : [];

  if (!Array.isArray(layoutToRender)) {
    console.error(
      "Cannot render: layoutToRender is not an array.",
      layoutToRender
    );
    return (
      <div className={styles.loadingPlaceholder}>
        Error loading layout data.
      </div>
    );
  }

  return (
    <div ref={measureRef} className={styles.pageContainer}>
      <Header />

      <Controls addBlock={addBlock} triggerFileInput={triggerFileInput} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
        aria-hidden="true"
        tabIndex={-1}
      />

      {containerWidth > 0 ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={100}
          width={containerWidth}
          isDraggable={!editingTitleId}
          isResizable={!editingTitleId}
          resizeHandles={["s", "e", "se", "w", "sw", "nw", "ne"]}
          onLayoutChange={handleLayoutChange}
          useCSSTransforms={true}
          compactType="vertical"
          preventCollision={false}
          draggableCancel=".non-draggable"
        >
          {layoutToRender.map((item) =>
            item && item.i ? (
              <div key={item.i} className={styles.block} data-grid={item}>
                <div className={styles.blockHeader}>
                  {editingTitleId === item.i ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editInputValue}
                      onChange={handleTitleChange}
                      onBlur={() => handleTitleBlur(item.i)}
                      onKeyDown={(e) => handleTitleKeyDown(e, item.i)}
                      onClick={(e) => e.stopPropagation()}
                      className={styles.titleInput}
                      aria-label="Edit block title"
                    />
                  ) : (
                    <h4
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTitleClick(item);
                      }}
                      className={styles.title}
                      title="Click to edit title"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleTitleClick(item);
                      }}
                    >
                      {item.content?.title || "Block Title"}
                    </h4>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRequest(item);
                    }}
                    className={styles.deleteButton}
                    aria-label={`Delete block ${item.content?.title || ""}`}
                    title="Delete block"
                  >
                    &#x2715;{" "}
                  </button>
                </div>
                <div className={styles.contentContainer}>
                  {item.content?.type === "text" && (
                    <div className={styles.content}>{item.content.text}</div>
                  )}
                  {item.content?.type === "image" && item.content.src && (
                    <img
                      src={item.content.src}
                      alt={item.content?.title || `Block ${item.i}`}
                      className={styles.imageContent}
                    />
                  )}
                  {item.content?.type === "chart" && (
                    <Charts
                      type={item.content.chartType}
                      data={item.content.data}
                    />
                  )}
                  {!item.content?.type && (
                    <div className={styles.contentPlaceholder}>
                      No content type defined.
                    </div>
                  )}
                </div>
              </div>
            ) : null
          )}
        </ResponsiveGridLayout>
      ) : (
        <Loading message="Initializing Layout..." />
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
      >
        Are you sure you want to delete the block titled "
        <strong>{blockToDeleteTitle || "this block"}</strong>"? This action
        cannot be undone.
      </ConfirmationModal>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect, useRef } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { v4 as uuidv4 } from "uuid";
import Charts from "../Charts/Charts";
import useMeasure from "react-use-measure";
import { getDefaultTitle, breakpoints, cols } from "../../utils/utils";
import styles from "./Dashboard.module.css";
import Controls from "../Controls/Controls";
import {
  sampleLineData,
  sampleBarData,
  sampleSparklineData,
  sampleSpiralData,
  defaultInitialLayout,
} from "../../data/data";

const ResponsiveGridLayout = WidthProvider(Responsive);

const Dashboard = () => {
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editInputValue, setEditInputValue] = useState("");
  const editInputRef = useRef(null);

  const [measureRef, bounds] = useMeasure();
  const [containerWidth, setContainerWidth] = useState(0);
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
  const [layouts, setLayouts] = useState(() => {
    const initial = defaultInitialLayout;
    return {
      lg: initial,
      md: initial,
      sm: initial,
      xs: initial,
      xxs: initial,
    };
  });
  const fileInputRef = useRef(null);

  const handleLayoutChange = (currentLayout, allLayouts) => {
    setLayouts((prevLayouts) => {
      const updatedLayouts = {};
      for (const breakpoint in allLayouts) {
        updatedLayouts[breakpoint] = allLayouts[breakpoint].map((newItem) => {
          const existingItem =
            (prevLayouts[breakpoint] || []).find(
              (item) => item.i === newItem.i
            ) || newItem;
          return {
            ...existingItem,
            x: newItem.x,
            y: newItem.y,
            w: newItem.w,
            h: newItem.h,
          };
        });
      }
      return updatedLayouts;
    });
  };

  const addBlock = (type, options = {}) => {
    const newId = uuidv4();
    let content = { type: type };
    content.title = getDefaultTitle(type, options);

    let blockWidth = 4;
    let blockHeight = 2;

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
    } else if (type === "image") {
      if (!options.src) {
        console.error("Source needed for image block!");
        return;
      }
      content.src = options.src;
      blockWidth = 4;
      blockHeight = 3;
    } else if (type === "text") {
      content.text = options.text || `New Text Block ${newId.substring(0, 4)}`;
      blockWidth = 3;
      blockHeight = 1;
    }

    const newItemCore = {
      i: newId,
      w: blockWidth,
      h: blockHeight,
      isDraggable: true,
      isResizable: true,
      content: content,
    };

    setLayouts((prevLayouts) => {
      const newLayouts = { ...prevLayouts };
      for (const breakpoint in newLayouts) {
        const currentBreakpointLayout = newLayouts[breakpoint] || [];
        const newItemLayout = {
          ...newItemCore,
          x:
            currentBreakpointLayout.reduce(
              (max, item) => Math.max(item.x + item.w, max),
              0
            ) % cols[breakpoint],
          y: Infinity,
        };
        newLayouts[breakpoint] = [...currentBreakpointLayout, newItemLayout];
      }
      return newLayouts;
    });
  };

  const handleTitleClick = (item) => {
    setEditingTitleId(item.i);
    setEditInputValue(item.content.title || "");
  };

  const handleTitleChange = (event) => {
    setEditInputValue(event.target.value);
  };

  const saveTitle = (itemId) => {
    setLayouts((prevLayouts) => {
      const newLayouts = { ...prevLayouts };

      for (const breakpoint in newLayouts) {
        if (newLayouts[breakpoint]) {
          newLayouts[breakpoint] = newLayouts[breakpoint].map((item) => {
            if (item.i === itemId) {
              return {
                ...item,
                content: {
                  ...item.content,

                  title:
                    editInputValue.trim() ||
                    getDefaultTitle(item.content.type, item.content),
                },
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
  };

  const handleTitleKeyDown = (event, itemId) => {
    if (event.key === "Enter") {
      saveTitle(itemId);
    } else if (event.key === "Escape") {
      setEditingTitleId(null);
      setEditInputValue("");
    }
  };

  const handleTitleBlur = (itemId) => {
    saveTitle(itemId);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addBlock("image", { src: reader.result });
      };
      reader.readAsDataURL(file);
    }

    if (event.target) {
      event.target.value = null;
    }
  };

  const deleteBlock = (idToDelete) => {
    setLayouts((prevLayouts) => {
      const newLayouts = { ...prevLayouts };
      for (const breakpoint in newLayouts) {
        newLayouts[breakpoint] = (newLayouts[breakpoint] || []).filter(
          (item) => item.i !== idToDelete
        );
      }
      return newLayouts;
    });

    if (editingTitleId === idToDelete) {
      setEditingTitleId(null);
      setEditInputValue("");
    }
  };

  return (
    <div ref={measureRef} className={styles.pageContainer}>
      <Controls addBlock={addBlock} triggerFileInput={triggerFileInput} />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
        accept="image/*"
        aria-hidden="true"
      />
      {containerWidth > 0 ? (
        <ResponsiveGridLayout
          width={containerWidth}
          className="layout"
          layouts={layouts}
          breakpoints={breakpoints}
          cols={cols}
          rowHeight={100}
          isDraggable={!editingTitleId}
          isResizable={!editingTitleId}
          resizeHandles={["s", "e", "n", "w", "sw", "se", "nw", "ne"]}
          onLayoutChange={handleLayoutChange}
          useCSSTransforms={false}
        >
          {(layouts.lg || []).map((item) => (
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
                  />
                ) : (
                  <h4
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTitleClick(item);
                    }}
                    className={styles.title}
                    title="Click to edit title"
                  >
                    {item.content?.title || "Block Title"}
                  </h4>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBlock(item.i);
                  }}
                  className={styles.deleteButton}
                >
                  &#x2715;
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
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      ) : (
        <div className={styles.loadingPlaceholder}>Loading..</div>
      )}
    </div>
  );
};

export default Dashboard;

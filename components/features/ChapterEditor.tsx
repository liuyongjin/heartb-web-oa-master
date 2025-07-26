"use client";

import { Icon } from "@iconify/react";
import { Button, ScrollShadow, Tooltip } from "@nextui-org/react";
import { cn } from "@nextui-org/theme";
import React, { useState, useEffect } from "react";

// Chapter type definition
interface Chapter {
  id: string;
  title: string;
  content: string;
  isEditing?: boolean;
}

interface ChapterEditorProps {
  chapter: Chapter;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onInsertChapterSplit: () => void;
  onSplitChapter: () => void;
  onTextareaClick: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
  onTextareaKeyUp: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onFinishImport?: () => void;
}

export const ChapterEditor: React.FC<ChapterEditorProps> = ({
  chapter,
  onContentChange,
  onInsertChapterSplit,
  onSplitChapter,
  onTextareaClick,
  onTextareaKeyUp,
  textareaRef,
  onFinishImport,
}) => {
  // History state
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize history when chapter changes
  useEffect(() => {
    setHistory([chapter.content]);
    setHistoryIndex(0);
    setIsInitialized(true);
  }, [chapter.id]); // Only reset when chapter ID changes

  // Handle initial content load
  useEffect(() => {
    if (!isInitialized && chapter.content) {
      setHistory([chapter.content]);
      setHistoryIndex(0);
      setIsInitialized(true);
    }
  }, [chapter.content, isInitialized]);

  // Handle content change and update history
  const handleContentChangeWithHistory = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newContent = e.target.value;

    // Only add to history if content has changed
    if (newContent !== history[historyIndex]) {
      // Remove all history entries after current index
      const newHistory = history.slice(0, historyIndex + 1);

      // Add new content to history
      newHistory.push(newContent);

      // Update history and index
      setHistory(newHistory);
      const newIndex = newHistory.length - 1;

      setHistoryIndex(newIndex);
    }

    // Call original content change handler
    onContentChange(e);
  };

  // Undo functionality
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;

      // Update history index first
      setHistoryIndex(newIndex);

      // Create a synthetic event to update content
      const syntheticEvent = {
        target: { value: history[newIndex] },
        currentTarget: { value: history[newIndex] },
      } as React.ChangeEvent<HTMLTextAreaElement>;

      // Update the content
      onContentChange(syntheticEvent);
    }
  };

  const handleInsertChapterSplit = () => {
    onInsertChapterSplit();
  };

  return (
    <div className="w-full flex-1 flex-col min-w-[600px] pl-4">
      <div className="flex flex-col">
        <header className="flex items-center justify-between pb-2">
          <div className="w-full flex justify-between items-center">
            <h4 className="flex gap-2 items-center text-md">
              <Icon
                className="text-default-500"
                height="20"
                icon="solar:sidebar-minimalistic-outline"
                width="20"
              />
              {chapter.title}
            </h4>
            {onFinishImport && (
              <Button className="text-white" size="sm" onPress={onFinishImport}>
                <Icon height="20" icon="ic:round-cloud-done" width="20" />
                Finish import
              </Button>
            )}
          </div>
        </header>
        <div className="w-full flex-1 flex-col min-w-[400px]">
          <div className={cn("flex flex-col gap-4")}>
            <div className="flex flex-col items-start">
              <div className="relative mb-5 w-full h-[500px] bg-slate-50 dark:bg-gray-800 rounded-lg">
                <div className="absolute inset-x-4 top-4 z-10 flex justify-between items-center">
                  <div className="flex justify-between">
                    <Tooltip content="Insert chapter split marker at cursor position">
                      <Button
                        className="mr-2 bg-white dark:bg-gray-700 text-black"
                        size="sm"
                        startContent={
                          <Icon
                            className="text-default-500"
                            icon="material-symbols:content-cut-outline"
                            width={20}
                          />
                        }
                        variant="flat"
                        onPress={handleInsertChapterSplit}
                      >
                        <Icon
                          icon="fluent:split-horizontal-12-filled"
                          width={20}
                        />
                        Insert chapter split
                      </Button>
                    </Tooltip>

                    <Tooltip content="Undo last change">
                      <Button
                        className="mr-2 bg-white dark:bg-gray-700"
                        isDisabled={historyIndex <= 0}
                        size="sm"
                        startContent={
                          <Icon
                            className="text-default-500"
                            icon="material-symbols:undo"
                            width={20}
                          />
                        }
                        variant="flat"
                        onPress={handleUndo}
                      >
                        Undo
                      </Button>
                    </Tooltip>
                  </div>

                  <Tooltip content="Split chapter at all split markers">
                    <Button
                      className="mr-2 bg-white dark:bg-gray-700 text-black"
                      size="sm"
                      startContent={
                        <Icon icon="ph:split-vertical" width={20} />
                      }
                      variant="flat"
                      onPress={onSplitChapter}
                    >
                      Split
                    </Button>
                  </Tooltip>
                </div>
                <div>
                  <ScrollShadow className="editScrollShow absolute left-2 right-2 bottom-10 top-12 text-base p-3 resize-none rounded-md border-solid border-inherit bg-slate-50 dark:bg-gray-800">
                    <div className="flex w-full h-full bg-slate-50 dark:bg-gray-200 rounded-lg p-2">
                      <textarea
                        ref={textareaRef}
                        className="flex-1 p-3 resize-none rounded-md border border-transparent bg-slate-50 dark:bg-gray-200 text-gray-900"
                        value={chapter.content}
                        onChange={handleContentChangeWithHistory}
                        onClick={onTextareaClick}
                        onKeyUp={onTextareaKeyUp}
                      />
                    </div>
                  </ScrollShadow>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

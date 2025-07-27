"use client";

import React, { useState, useRef, useEffect } from "react";

import { title, subtitle } from "@/components/primitives";
import { FileImport } from "@/components/features/FileImport";
import { ChaptersSidebar } from "@/components/features/ChaptersSidebar";
import { ChapterEditor } from "@/components/features/ChapterEditor";
interface Chapter {
  id: string;
  title: string;
  content: string;
  isEditing?: boolean;
}

const defaultChapters: Chapter[] = [
  {
    id: "1",
    title: "Chapter 1 - Blank",
    content: "",
  },
];

export default function Home() {
  // State for managing chapters
  const [chapters, setChapters] = useState<Chapter[]>(defaultChapters);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(
    null,
  );
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Get the currently selected chapter
  const selectedChapter = chapters.find(
    (chapter) => chapter.id === selectedChapterId,
  );

  // Function to handle file import
  const handleFileImport = (text: string) => {
    const newChapters = divideIntoChapters(text);

    setChapters(newChapters);

    if (newChapters.length > 0) {
      setSelectedChapterId(newChapters[0].id);
    }
  };

  // Function to divide text into chapters
  const divideIntoChapters = (text: string): Chapter[] => {
    // Check if text contains special separators
    const specialSplitters = ["---CHAPTER END---", "====SPLIT CHAPTER===="];

    for (const splitter of specialSplitters) {
      if (text.includes(splitter)) {
        const parts = text.split(splitter);

        return parts
          .filter((part) => part.trim().length > 0)
          .map((part, index) => {
            // Try to extract chapter title from content
            const titleMatch = part
              .trim()
              .match(
                /^(?:Chapter|CHAPTER)\s+(\d+|[A-Z]+|[IVXLCDM]+)(?:\s*[:|-]\s*(.+?))?(?=\n|$)/i,
              );
            let title = `Chapter ${index + 1}`;

            if (titleMatch) {
              title = titleMatch[2]
                ? `Chapter ${titleMatch[1]} - ${titleMatch[2].trim()}`
                : `Chapter ${titleMatch[1]}`;
            }

            return {
              id: generateId(),
              title: title,
              content: part.trim(),
            };
          });
      }
    }

    // Improved chapter recognition regex, supporting more formats
    const chapterRegex =
      /(?:Chapter|CHAPTER)\s+(\d+|[A-Z]+|[IVXLCDM]+)(?:\s*[:|-]\s*(.+?))?(?=\n|$)/gi;

    // Find all chapter matches
    const matches: { index: number; chapterNum: string; title: string }[] = [];
    let match;

    while ((match = chapterRegex.exec(text)) !== null) {
      matches.push({
        index: match.index,
        chapterNum: match[1],
        title: match[2] || "",
      });
    }

    // If no chapters found, treat the entire text as one chapter
    if (matches.length === 0) {
      return [
        {
          id: generateId(),
          title: "Chapter 1",
          content: text,
        },
      ];
    }

    // Create chapters based on matches
    return matches.map((match, index) => {
      const start = match.index;
      const end =
        index < matches.length - 1 ? matches[index + 1].index : text.length;
      const content = text.slice(start, end);

      // Extract title (if available), otherwise use chapter number
      const chapterTitle = match.title
        ? `Chapter ${match.chapterNum} - ${match.title.trim()}`
        : `Chapter ${match.chapterNum}`;

      return {
        id: generateId(),
        title: chapterTitle,
        content: content,
      };
    });
  };

  // Generate a unique ID for chapters
  const generateId = (): string => {
    return Math.random().toString(36).substring(2, 11);
  };

  // Handle chapter selection
  const handleChapterSelect = (chapterId: string) => {
    setSelectedChapterId(chapterId);
  };

  // Handle chapter content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!selectedChapterId) return;

    const newContent = e.target.value;

    setCursorPosition(e.target.selectionStart);

    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === selectedChapterId
          ? { ...chapter, content: newContent }
          : chapter,
      ),
    );
  };

  // Insert chapter split marker at cursor position
  const insertChapterSplit = () => {
    if (!selectedChapterId || cursorPosition === null) return;

    const chapter = chapters.find((c) => c.id === selectedChapterId);

    if (!chapter) return;

    const beforeCursor = chapter.content.substring(0, cursorPosition);
    const afterCursor = chapter.content.substring(cursorPosition);
    const newContent = `${beforeCursor}\n====SPLIT CHAPTER====\n${afterCursor}`;

    setChapters((prev) =>
      prev.map((c) =>
        c.id === selectedChapterId ? { ...c, content: newContent } : c,
      ),
    );

    // Update cursor position to after the inserted text
    const newPosition = cursorPosition + "\n====SPLIT CHAPTER====\n".length;

    setCursorPosition(newPosition);

    // Focus and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  // Split the chapter at the split markers
  const splitChapter = () => {
    if (!selectedChapterId) return;

    const chapter = chapters.find((c) => c.id === selectedChapterId);

    if (!chapter) return;

    // Check if chapter has split markers
    if (!chapter.content.includes("====SPLIT CHAPTER====")) return;

    // Split content at markers
    const parts = chapter.content.split("====SPLIT CHAPTER====");

    if (parts.length <= 1) return;

    // Extract basic info from original title
    let baseTitle = chapter.title;

    // Create new chapters from split parts
    const newChapters: Chapter[] = parts.map((part, index) => {
      // Try to extract title from content
      let newTitle = baseTitle;

      if (index > 0) {
        newTitle = `${baseTitle} - ${index + 1}`;
      }

      if (index === 0) {
        // Update existing chapter with first part
        return {
          ...chapter,
          content: part.trim(),
        };
      } else {
        // Create new chapters for remaining parts
        return {
          id: generateId(),
          title: newTitle,
          content: part.trim(),
        };
      }
    });

    // Replace original chapter with new chapters
    setChapters((prev) => {
      const chapterIndex = prev.findIndex((c) => c.id === selectedChapterId);

      if (chapterIndex === -1) return prev;

      const result = [
        ...prev.slice(0, chapterIndex),
        ...newChapters,
        ...prev.slice(chapterIndex + 1),
      ];

      return result;
    });
  };

  // Merge the current chapter with the next one
  const mergeWithNextChapter = () => {
    if (!selectedChapterId) return;

    const chapterIndex = chapters.findIndex((c) => c.id === selectedChapterId);

    if (chapterIndex === -1 || chapterIndex >= chapters.length - 1) return;

    const currentChapter = chapters[chapterIndex];
    const nextChapter = chapters[chapterIndex + 1];

    // Merge the content
    const mergedContent = `${currentChapter.content}\n\n${nextChapter.content}`;

    // Update chapters
    setChapters((prev) => [
      ...prev.slice(0, chapterIndex),
      { ...currentChapter, content: mergedContent },
      ...prev.slice(chapterIndex + 2),
    ]);
  };

  // Handle textarea click to update cursor position
  const handleTextareaClick = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  // Handle textarea keyup to update cursor position
  const handleTextareaKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);
  };

  // Reset cursor position when changing chapters
  useEffect(() => {
    setCursorPosition(null);
  }, [selectedChapterId]);

  // Delete chapter function
  const deleteChapter = (chapterId: string) => {
    setChapters((prev) => prev.filter((chapter) => chapter.id !== chapterId));

    // If the deleted chapter was selected, select another chapter if available
    if (chapterId === selectedChapterId) {
      const remainingChapters = chapters.filter(
        (chapter) => chapter.id !== chapterId,
      );

      if (remainingChapters.length > 0) {
        setSelectedChapterId(remainingChapters[0].id);
      } else {
        setSelectedChapterId(null);
      }
    }
  };

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center">
        <h1 className={title()}>Novel Chapter&nbsp;</h1>
        <h1 className={title({ color: "violet" })}>Management&nbsp;</h1>
        <h2 className={subtitle({ class: "mt-4" })}>
          Upload a novel text file to automatically divide it into chapters
        </h2>
      </div>
      <div className="w-full max-w-7xl border border-divider">
        {/* File import */}
        <FileImport onFileImport={handleFileImport} />
        <div className="flex flex-row mr-4 ml-4 mt-4 pb-16">
          {/* Chapters sidebar */}
          <ChaptersSidebar
            chapters={chapters}
            selectedChapterId={selectedChapterId}
            onChapterSelect={handleChapterSelect}
            onDeleteChapter={deleteChapter}
            onMergeWithNextChapter={mergeWithNextChapter}
          />
          {/* Chapter editor */}
          <ChapterEditor
            chapter={selectedChapter || defaultChapters[0]}
            textareaRef={textareaRef}
            onContentChange={handleContentChange}
            onInsertChapterSplit={insertChapterSplit}
            onSplitChapter={splitChapter}
            onTextareaClick={handleTextareaClick}
            onTextareaKeyUp={handleTextareaKeyUp}
          />
        </div>
      </div>
    </section>
  );
}

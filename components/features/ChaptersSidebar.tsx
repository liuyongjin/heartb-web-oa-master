"use client";

import { Icon } from "@iconify/react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  ScrollShadow,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
} from "@nextui-org/react";
import { cn } from "@nextui-org/theme";
import React from "react";
// Chapter type definition
interface Chapter {
  id: string;
  title: string;
  content: string;
  isEditing?: boolean;
}

interface ChaptersSidebarProps {
  chapters: Chapter[];
  selectedChapterId: string | null;
  onChapterSelect: (chapterId: string) => void;
  onMergeWithNextChapter: () => void;
  onDeleteChapter?: (chapterId: string) => void;
}

export const ChaptersSidebar: React.FC<ChaptersSidebarProps> = ({
  chapters,
  selectedChapterId,
  onChapterSelect,
  onMergeWithNextChapter,
  onDeleteChapter,
}) => {
  // Handle chapter deletion
  const handleDeleteChapter = (chapterId: string) => {
    if (onDeleteChapter) {
      onDeleteChapter(chapterId);
    }
  };

  return (
    <div
      className={cn(
        "relative flex h-full w-96 max-w-[384px] flex-1 flex-col !border-r-small border-divider pr-6 transition-[transform,opacity,margin] duration-250 ease-in-out",
      )}
      id="menu"
    >
      <header className="flex items-center text-md font-medium text-default-500 group-data-[selected=true]:text-foreground">
        <Icon
          className="text-default-500 mr-2"
          icon="solar:clipboard-text-outline"
          width={20}
        />
        Chapters
      </header>

      <ScrollShadow className="max-h-[calc(500px)] -mr-4" id="menu-scroll">
        <div className="flex flex-col gap-4 py-3 pr-4">
          {chapters.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No chapters yet. Select a file to import.
            </div>
          ) : (
            chapters.map((chapter) => (
              <Card
                key={chapter.id}
                isPressable
                className={`max-w-[384px] border-1 border-divider/15 ${chapter.id === selectedChapterId ? "bg-themeBlue/20" : ""}`}
                shadow="none"
                onPress={() => onChapterSelect(chapter.id)}
              >
                <CardHeader className="flex items-center justify-between">
                  <div className="flex gap-1.5 w-full">
                    {chapter.id === selectedChapterId && (
                      <Chip
                        className="mr-1 text-themeBlue bg-themeBlue/20"
                        radius="sm"
                        size="sm"
                        variant="flat"
                      >
                        Editing
                      </Chip>
                    )}
                    <p className="text-left mr-1 truncate">{chapter.title}</p>

                    <div className="ml-auto flex">
                      {chapter.id === selectedChapterId && (
                        <Dropdown>
                          <DropdownTrigger>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:bg-default-100">
                              <Icon
                                className="text-default-500"
                                icon="ph:dots-three-bold"
                                width={20}
                              />
                            </div>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Chapter actions">
                            <DropdownSection showDivider title="Action">
                              <DropdownItem
                                key="combine"
                                onPress={() => {
                                  onMergeWithNextChapter();
                                }}
                              >
                                <div className="flex items-center">
                                  <Icon
                                    className="mr-2"
                                    icon="iconoir:vertical-merge"
                                    width={20}
                                  />
                                  <div>
                                    <p>
                                      <strong>Combine</strong> with next chapter
                                    </p>
                                    <p className="text-default-500">
                                      Combine this chapter with the next one
                                    </p>
                                  </div>
                                </div>
                              </DropdownItem>
                            </DropdownSection>
                            <DropdownSection title="Danger Zone">
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                onPress={() => handleDeleteChapter(chapter.id)}
                              >
                                <div className="flex items-center">
                                  <Icon
                                    className="mr-2"
                                    icon="mdi:delete-alert"
                                    width={20}
                                  />
                                  Delete this chapter
                                </div>
                              </DropdownItem>
                            </DropdownSection>
                          </DropdownMenu>
                        </Dropdown>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody>
                  <p className="line-clamp-2">{chapter.content}</p>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </ScrollShadow>
    </div>
  );
};

import { createContext, useContext, useState } from "react";

const TextLibraryContext = createContext(null);

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function TextLibraryProvider({ children }) {
  const [libraries, setLibraries] = useState([]);

  const saveLibrary = (draft) => {
    const timestamp = Date.now();
    const categories = (draft.categories ?? []).map((category) => ({
      id: category.id ?? createId("category"),
      name: category.name.trim(),
    }));
    const entries = (draft.entries ?? []).map((entry) => ({
      id: entry.id ?? createId("entry"),
      text: entry.text.trim(),
      categoryId: entry.categoryId ?? categories[0]?.id ?? null,
      createdAt: entry.createdAt ?? timestamp,
    }));

    const normalizedLibrary = {
      id: draft.id ?? createId("library"),
      title: draft.title.trim() || "Untitled Library",
      bannerUri: draft.bannerUri ?? null,
      categories,
      entries,
      createdAt: draft.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    setLibraries((currentLibraries) => {
      const libraryIndex = currentLibraries.findIndex(
        (library) => library.id === normalizedLibrary.id
      );

      if (libraryIndex === -1) {
        return [normalizedLibrary, ...currentLibraries];
      }

      const nextLibraries = [...currentLibraries];
      nextLibraries[libraryIndex] = normalizedLibrary;
      return nextLibraries.sort((a, b) => b.updatedAt - a.updatedAt);
    });

    return normalizedLibrary.id;
  };

  const getLibraryById = (id) =>
    libraries.find((library) => library.id === id) ?? null;

  const recentEntries = libraries
    .flatMap((library) =>
      library.entries.map((entry) => ({
        ...entry,
        libraryId: library.id,
        libraryTitle: library.title,
        bannerUri: library.bannerUri,
        categoryName:
          library.categories.find((category) => category.id === entry.categoryId)
            ?.name ?? "Uncategorized",
      }))
    )
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <TextLibraryContext.Provider
      value={{
        libraries,
        recentEntries,
        getLibraryById,
        saveLibrary,
      }}
    >
      {children}
    </TextLibraryContext.Provider>
  );
}

export function useTextLibraries() {
  const context = useContext(TextLibraryContext);

  if (!context) {
    throw new Error("useTextLibraries must be used within TextLibraryProvider");
  }

  return context;
}

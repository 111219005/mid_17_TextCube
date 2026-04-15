import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const useTextLibraryStore = create(
  persist(
    (set, get) => ({
      libraries: [],

      saveLibrary: (draft) => {
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

        set((state) => {
          const currentLibraries = state.libraries;
          const libraryIndex = currentLibraries.findIndex(
            (library) => library.id === normalizedLibrary.id
          );

          if (libraryIndex === -1) {
            return { libraries: [normalizedLibrary, ...currentLibraries] };
          }

          const nextLibraries = [...currentLibraries];
          nextLibraries[libraryIndex] = normalizedLibrary;
          return { libraries: nextLibraries.sort((a, b) => b.updatedAt - a.updatedAt) };
        });

        return normalizedLibrary.id;
      },

      getLibraryById: (id) => get().libraries.find((library) => library.id === id) ?? null,
    }),
    {
      name: "text-library-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function TextLibraryProvider({ children }) {
  return children;
}

export function useTextLibraries() {
  const store = useTextLibraryStore();

  const recentEntries = store.libraries
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

  return {
    ...store,
    recentEntries,
  };
}

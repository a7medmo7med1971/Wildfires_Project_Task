"use client";
//this is file use el functions and sended to navbar "shared all aplication is a call back function" //
import { createContext, useContext, useRef } from "react";
import toast from "react-hot-toast";
const SelectionContext = createContext<SelectionContextType | null>(null);

type SelectedFire = {
  id: number;
  type: number;
  graphic: __esri.Graphic;
}; // selected fire data

type SelectionContextType = {
  clearSelection: () => void;
  setClearSelection: (fn: () => void) => void;
  setSelectedFires: (fires: SelectedFire[]) => void;
  saveSelectedFires: () => Promise<void>;
};

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const clearSelectionRef = useRef<() => void>(() => {});
  const selectedFiresRef = useRef<SelectedFire[]>([]);
  const setClearSelection = (fn: () => void) => {
    clearSelectionRef.current = fn;
  };
  const setSelectedFires = (fires: SelectedFire[]) => {
    selectedFiresRef.current = fires;
  };

  // post data in api
  const saveSelectedFires = async () => {
    const loadingToast = toast.loading("Saving selected fires..."); // check api

    try {
      const fires = selectedFiresRef.current;

      if (fires.length === 0) {
        toast.error("No fires selected", {
          id: loadingToast,
        });
        return;
      }

      const payload = fires.map((fire) => { // it is payload el user sending api
        const geometry = fire.graphic.geometry;

        let spatialData = null;

        if (geometry?.type === "point") {
          spatialData = {
            type: "point",
            x: geometry.x,
            y: geometry.y,
          };
        } else if (geometry?.type === "polyline") {
          spatialData = {
            type: "polyline",
            paths: geometry.paths,
          };
        } else if (geometry?.type === "polygon") {
          spatialData = {
            type: "polygon",
            rings: geometry.rings,
          };
        }

        return {
          id: fire.id,
          attributes: {
            objectid: fire.id,
            ...(fire.type !== undefined && {
              eventtype: fire.type,
            }),
          },
          geometry: spatialData,
        };
      }); // create api payload

      const response = await fetch("http://localhost:5240/api/fires", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("API Error:", errorText);

        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      toast.success("Fires saved successfully", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Failed to save fires:", error);

      toast.error("Failed to save fires", {
        id: loadingToast,
      });
    }
  };
  
//remove any spatial data on map
  const removeSelectedFires = async () => {
    // remove spatial data in map
    const fires = selectedFiresRef.current;

    if (fires.length === 0) {
      toast.error("No fires selected");
      return;
    }

    const loadingToast = toast.loading("Removing selected fires...");

    try {
      await clearSelectionRef.current(); // remove selected features

      toast.success("Selected fires removed successfully", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Failed to remove fires:", error);

      toast.error("Failed to remove selected fires", {
        id: loadingToast,
      });
    }
  };

  return (
    <SelectionContext.Provider
      value={{
        clearSelection: removeSelectedFires, // remove selected fires
        setClearSelection,
        setSelectedFires,
        saveSelectedFires,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error("useSelection must be used inside SelectionProvider");
  }

  return context;
}

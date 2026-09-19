"use client";

import { useEffect } from "react";

import LayerList from "@arcgis/core/widgets/LayerList";
import MapView from "@arcgis/core/views/MapView";

type LayerListWidgetProps = {
  view: MapView;
};

export default function LayerListWidget({ view }: LayerListWidgetProps) {
  useEffect(() => {
    if (!view) return;

    const layerList = new LayerList({
      view,
    });

    view.ui.add(layerList, "top-right");

    return () => {
      view.ui.remove(layerList);
      layerList.destroy();
    };
  }, [view]);

  return null;
}

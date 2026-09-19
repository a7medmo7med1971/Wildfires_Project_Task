"use client";

import { useEffect } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import SceneView from "@arcgis/core/views/SceneView";
import Basemap from "@arcgis/core/Basemap";
import BasemapToggle from "@arcgis/core/widgets/BasemapToggle";
import TileLayer from "@arcgis/core/layers/TileLayer";

type Props = {
  mapView: MapView;
  map: Map;
  container: HTMLDivElement;
};

export default function MapControls({ mapView, map, container }: Props) {
  useEffect(() => {
    if (!mapView || !map || !container) return;

    const grayBasemap = map.basemap; // use current basemap

    const imageryBasemap = new Basemap({
      id: "imagery",
      title: "Imagery",
      baseLayers: [
        new TileLayer({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
        }),
      ],
    });

    // 3D map
    const scene = new Map({
      basemap: grayBasemap,
    });

    // 3D view
    const sceneView = new SceneView({
      map: scene,
      container: null,
    });

    // 2D / 3D button
    const viewControl = document.createElement("div");

    viewControl.className =
      "esri-component esri-widget esri-widget--button esri-interactive";

    viewControl.innerHTML = "3D";

    // basemap toggle
    const basemapSwitcher = new BasemapToggle({
      view: mapView,
      nextBasemap: imageryBasemap,
    });

    // change view
    const changeView = async () => {
      if (mapView.container) {
        sceneView.viewpoint = mapView.viewpoint.clone();
        sceneView.map.basemap = mapView.map.basemap;

        mapView.container = null;
        sceneView.container = container;

        viewControl.innerHTML = "2D";

        basemapSwitcher.view = sceneView;

        basemapSwitcher.nextBasemap =
          sceneView.map.basemap.id === "gray-vector"
            ? imageryBasemap
            : grayBasemap;

        sceneView.ui.add(viewControl, "top-left");
        sceneView.ui.add(basemapSwitcher, "bottom-right");
      } else {
        mapView.viewpoint = sceneView.viewpoint.clone();
        mapView.map.basemap = sceneView.map.basemap;

        sceneView.container = null;
        mapView.container = container;

        viewControl.innerHTML = "3D";

        basemapSwitcher.view = mapView;

        basemapSwitcher.nextBasemap =
          mapView.map.basemap.id === "gray-vector"
            ? imageryBasemap
            : grayBasemap;

        mapView.ui.add(viewControl, "top-left");
        mapView.ui.add(basemapSwitcher, "bottom-right");
      }
    };

    // events
    viewControl.addEventListener("click", changeView);

    // initial UI
    mapView.ui.add(viewControl, "top-left");
    mapView.ui.add(basemapSwitcher, "bottom-right");

    return () => {
      // cleanup
      viewControl.removeEventListener("click", changeView);

      mapView.ui.remove(viewControl);
      mapView.ui.remove(basemapSwitcher);

      basemapSwitcher.destroy();
      sceneView.destroy();
    };
  }, [mapView, map, container]);

  return null;
}

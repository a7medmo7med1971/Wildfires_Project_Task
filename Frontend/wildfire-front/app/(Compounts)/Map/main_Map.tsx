"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import LayerListWidget from "@/app/(Compounts)/Map/(Widgets)/MapWidgets";
import MapControls from "@/app/(Compounts)/Map/(Widgets)/MapControls";
import { useSelection } from "@/app/(Compounts)/Context/SelectionContext";
import "@arcgis/core/assets/esri/themes/light/main.css";

type SelectedFeature = {
  id: number;
  type: number;
  graphic: __esri.Graphic;
}; // type data in attribute

export default function WildfireMap() {
  const mapDiv = useRef<HTMLDivElement>(null); // map container

  const mapViewRef = useRef<MapView | null>(null); // map view
  const [view, setView] = useState<__esri.MapView | null>(null);
  const { setClearSelection, setSelectedFires } = useSelection(); // context functions

  const selectedFeaturesRef = useRef<SelectedFeature[]>([]); // selected features
  const hiddenFeaturesRef = useRef<SelectedFeature[]>([]); // hidden features
  const highlightHandles = useRef<__esri.Handle[]>([]); // highlight handles

  const clearSelection = async () => {
    const selected = selectedFeaturesRef.current;
    const currentMapView = mapViewRef.current;

    if (!currentMapView || selected.length === 0) {
      return;
    }

    currentMapView.closePopup(); // close attributes / popup

    hiddenFeaturesRef.current.push(...selected); // add selected to hidden

    const layers = [
      ...new Set(selected.map((item) => item.graphic.layer as FeatureLayer)),
    ]; // get selected layers

    for (const layer of layers) {
      const layerView = await currentMapView.whenLayerView(layer); // get layer view

      const ids = hiddenFeaturesRef.current
        .filter((item) => item.graphic.layer === layer)
        .map((item) => item.id); // get hidden ids

      if (ids.length > 0) {
        layerView.filter = {
          where: `OBJECTID NOT IN (${ids.join(",")})`,
        }; // hide selected features
      }
    }

    highlightHandles.current.forEach((handle) => {
      handle.remove(); // remove highlight
    });

    highlightHandles.current = [];

    selectedFeaturesRef.current = []; // clear current selection
    setSelectedFires([]); // update context
  };

  useEffect(() => {
    setClearSelection(clearSelection); // register clear function

    return () => {
      setClearSelection(() => {}); // cleanup
    };
  }, []);

  useEffect(() => {
    if (!mapDiv.current) return;

    let mapView: MapView | null = null;
    let pointerMoveHandler: __esri.Handle | null = null;
    let clickHandler: __esri.Handle | null = null;

    const setupMap = async () => {
      const serviceUrl =
        "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Wildfire/FeatureServer";

      const loadingToast = toast.loading("Loading wildfire data..."); // loading message

      try {
        const response = await axios.get(serviceUrl, {
          params: {
            f: "json",
          },
        }); // get service data

        const serviceData = response.data;

        const wildfireLayers: FeatureLayer[] = serviceData.layers.map(
          (layerInfo: { id: number | string; name: string }) =>
            new FeatureLayer({
              url: `${serviceUrl}/${layerInfo.id}`,
              title: layerInfo.name,
              popupTemplate: {
                title: "Wildfire",
                content: [
                  {
                    type: "fields",
                    fieldInfos: [
                      {
                        fieldName: "objectid",
                        label: "ID",
                      },
                      {
                        fieldName: "eventtype",
                        label: "Type",
                      },
                    ],
                  },
                ],
              },
            }),
        ); // create feature layers

        const map = new Map({
          basemap: "gray-vector",
          layers: wildfireLayers,
        }); // create map

        mapView = new MapView({
          container: mapDiv.current,
          map: map,
          center: [0, 20],
          zoom: 2,
        }); // create map view

        mapViewRef.current = mapView;

        await mapView.when();


        await Promise.all(
          wildfireLayers.map((layer) => mapView!.whenLayerView(layer)),
        ); // wait for all layers


        setView(mapView); // save view

        toast.success("Wildfire data loaded successfully", {
          id: loadingToast,
        }); // success message

        pointerMoveHandler = mapView.on("pointer-move", async (event) => {
          const hitResponse = await mapView!.hitTest(event); // check features

          const hasFeature = hitResponse.results.some(
            (result) =>
              result.type === "graphic" &&
              wildfireLayers.includes(result.graphic.layer as FeatureLayer),
          ); // check wildfire layer

          if (mapView?.container) {
            mapView.container.style.cursor = hasFeature ? "pointer" : "default"; // change cursor
          }
        });

        clickHandler = mapView.on("click", async (event) => {
          const hitResponse = await mapView!.hitTest(event); // get clicked feature

          const graphicResult = hitResponse.results.find(
            (result) =>
              result.type === "graphic" &&
              wildfireLayers.includes(result.graphic.layer as FeatureLayer),
          ); // find wildfire graphic

          if (!graphicResult || graphicResult.type !== "graphic") {
            return;
          }

          const graphic = graphicResult.graphic;

          const objectId = graphic.attributes?.objectid; // get object id
          const eventType = graphic.attributes?.eventtype; // get event type

          if (objectId === undefined) {
            return;
          }

          const alreadySelected = selectedFeaturesRef.current.some(
            (item) => item.id === objectId,
          ); // check selected

          if (alreadySelected) {
            return;
          }

          const layer = graphic.layer as FeatureLayer; // get layer

          const layerView = await mapView!.whenLayerView(layer); // get layer view

          const highlightHandle = layerView.highlight(objectId); // highlight feature

          highlightHandles.current.push(highlightHandle);

          selectedFeaturesRef.current.push({
            id: objectId,
            type: eventType,
            graphic: graphic,
          }); // save selected feature

          setSelectedFires([...selectedFeaturesRef.current]); // update context
        });
      } catch (error) {
        console.error(error);

        toast.error("Failed to load wildfire data", {
          id: loadingToast,
        }); // error message
      }
    };

    setupMap();

    return () => {
      pointerMoveHandler?.remove(); // remove pointer event
      clickHandler?.remove(); // remove click event

      highlightHandles.current.forEach((handle) => {
        handle.remove(); // remove highlights
      });

      highlightHandles.current = [];

      selectedFeaturesRef.current = [];
      hiddenFeaturesRef.current = [];
      mapViewRef.current = null;

      mapView?.destroy(); // destroy map
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
      }}
    >
      <div
        ref={mapDiv}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      {view && <LayerListWidget view={view} />} {/* layer list */}
      {view && mapDiv.current && (
        <MapControls
          mapView={view as MapView}
          map={view.map as Map}
          container={mapDiv.current}
        />
      )}{" "}
      {/* map controls */}
    </div>
  );
}

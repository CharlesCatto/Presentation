declare module "leaflet.markercluster" {
  import * as L from "leaflet";
  console.info("Custom type declaration for leaflet.markercluster loaded!");
  export class MarkerCluster extends L.LayerGroup {
    getChildCount(): number;
    toMultiPoint(): L.LatLngBounds;
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    hasLayer(layer: L.Layer): boolean;
    getBounds(): L.LatLngBounds;
    zoomToBounds(options?: L.ZoomOptions): void;
    getLayers(): L.Layer[];
    getAllChildMarkers(): L.Marker[];
    spiderfy(): void;
    unspiderfy(): void;
    getLatLng(): L.LatLng;
    setLatLng(latlng: L.LatLngExpression): this;
    getIcon(): L.Icon<L.IconOptions> | L.DivIcon;
    setIcon(icon: L.Icon<L.IconOptions> | L.DivIcon): this;
    getElement(): HTMLElement | undefined;
    getPopup(): L.Popup | undefined;
    bindPopup(content: L.Content, options?: L.PopupOptions): this;
    unbindPopup(): this;
    openPopup(latlng?: L.LatLngExpression): this;
    closePopup(): this;
    togglePopup(): this;
    isPopupOpen(): boolean;
    setPopupContent(content: L.Content): this;
    getTooltip(): L.Tooltip | undefined;
    bindTooltip(content: L.Content, options?: L.TooltipOptions): this;
    unbindTooltip(): this;
    openTooltip(latlng?: L.LatLngExpression): this;
    closeTooltip(): this;
    toggleTooltip(): this;
    isTooltipOpen(): boolean;
    setTooltipContent(content: L.Content): this;
  }
}

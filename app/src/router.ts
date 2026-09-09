import { createRouter, createWebHistory } from "vue-router";
import FieldAnalysisView from "./views/FieldAnalysisView.vue";
import ImageAnalysisView from "./views/ImageAnalysisView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "field-analysis",
      component: FieldAnalysisView,
      meta: { title: "Field analysis" },
    },
    {
      path: "/image",
      name: "image-analysis",
      component: ImageAnalysisView,
      meta: { title: "Image analysis", experimental: true },
    },
  ],
});

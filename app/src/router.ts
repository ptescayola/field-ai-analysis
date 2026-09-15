import { createRouter, createWebHistory } from "vue-router"
import FieldAnalysisView from "./views/FieldAnalysisView.vue"
import ImageAnalysisView from "./views/ImageAnalysisView.vue"

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "field-analysis",
      component: FieldAnalysisView,
    },
    {
      path: "/image",
      name: "image-analysis",
      component: ImageAnalysisView,
    },
  ],
})

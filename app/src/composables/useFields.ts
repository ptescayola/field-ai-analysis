import { onMounted, ref } from "vue";
import { fetchField, fetchFields } from "../api/client";
import type { FieldData, FieldListItem } from "../types";

export function useFields(autoSelectFirst = true) {
  const fields = ref<FieldListItem[]>([]);
  const selectedFile = ref("");
  const fieldData = ref<FieldData | null>(null);
  const loadingFields = ref(true);
  const loadingField = ref(false);
  const error = ref<string | null>(null);

  async function loadSelectedField(): Promise<void> {
    if (!selectedFile.value) return;
    loadingField.value = true;
    error.value = null;
    try {
      fieldData.value = await fetchField(selectedFile.value);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error loading field";
      fieldData.value = null;
    } finally {
      loadingField.value = false;
    }
  }

  async function loadFieldsList(): Promise<void> {
    loadingFields.value = true;
    error.value = null;
    try {
      fields.value = await fetchFields();
      if (autoSelectFirst && fields.value.length > 0) {
        selectedFile.value = fields.value[0].file;
        await loadSelectedField();
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Error loading fields";
    } finally {
      loadingFields.value = false;
    }
  }

  async function selectField(file: string): Promise<void> {
    selectedFile.value = file;
    if (!file) {
      fieldData.value = null;
      return;
    }
    await loadSelectedField();
  }

  onMounted(() => {
    void loadFieldsList();
  });

  return {
    fields,
    selectedFile,
    fieldData,
    loadingFields,
    loadingField,
    error,
    loadFieldsList,
    loadSelectedField,
    selectField,
  };
}

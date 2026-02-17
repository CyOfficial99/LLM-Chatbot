import { API_BASE_URL } from "./config";

export interface TestResponse {
  message: string;
}

export const callTest = async (): Promise<TestResponse> => {
  const response = await fetch(`${API_BASE_URL}/test`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: TestResponse = await response.json();
  return data;
};

interface ModelResponse {
  model: { model: string }[];
}

export const fetchModelList = async (): Promise<ModelResponse> => {
  const response = await fetch(`${API_BASE_URL}/model`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const modelList: ModelResponse = await response.json();
  return modelList;
};
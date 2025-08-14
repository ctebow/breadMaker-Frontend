import axios from "axios";

export async function sendImageAndData(imageFile, componentIds) {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("json_data", JSON.stringify(componentIds));

    const response = await axios.post("http://127.0.0.1:8000/process", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

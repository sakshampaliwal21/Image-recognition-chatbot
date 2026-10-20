const imageInput = document.getElementById("image-input");
const imagePreview = document.getElementById("image-preview");

imageInput.addEventListener("change", function () {
    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    const imageUrl = URL.createObjectURL(file);

    imagePreview.innerHTML = "";

    const image = document.createElement("img");
    image.src = imageUrl;
    image.alt = "Selected image";

    imagePreview.appendChild(image);
});

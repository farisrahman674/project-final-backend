import prisma from "./client";

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Vivo V30 Pro",
        price: 8500000,
        image: "Vivo V30 Pro.jpg",
        description:
          "Smartphone dengan kamera Zeiss, performa tangguh dan layar AMOLED 120Hz.",
      },
      {
        name: "Realme GT 6",
        price: 9000000,
        image: "Realme GT 6.jpg",
        description:
          "Flagship killer dengan Snapdragon 8s Gen 3 dan sistem pendingin canggih.",
      },
      {
        name: "Xiaomi 14 Pro",
        price: 11000000,
        image: "Xiaomi 14 Pro.jpg",
        description:
          "Smartphone flagship dengan lensa Leica dan layar LTPO OLED 120Hz.",
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        price: 18000000,
        image: "Samsung Galaxy S24 Ultra.jpg",
        description:
          "HP flagship dengan S-Pen, kamera 200MP, dan layar super jernih.",
      },
      {
        name: "iPhone 15 Pro",
        price: 19000000,
        image: "iPhone 15 Pro.jpg",
        description:
          "iPhone terbaru dengan chip A17 Pro dan desain titanium ringan.",
      },
      {
        name: "Acer Swift X",
        price: 13000000,
        image: "Acer Swift X.jpg",
        description:
          "Laptop tipis dengan performa tinggi untuk editing dan produktivitas.",
      },
      {
        name: "HP Victus 16",
        price: 15000000,
        image: "LAPTOP.jpg",
        description:
          "Laptop gaming dengan layar besar 144Hz dan performa AMD Ryzen.",
      },
      {
        name: "Lenovo Legion 5 Pro",
        price: 21000000,
        image: "Lenovo Legion 5 Pro.jpg",
        description: "Laptop gaming premium dengan layar QHD dan RTX 4060.",
      },
      {
        name: "MacBook Air M2",
        price: 18000000,
        image: "MacBook Air M2.jpg",
        description:
          "Laptop ringan dengan chip Apple M2, ideal untuk pelajar & profesional.",
      },
      {
        name: "ASUS ROG Strix G16",
        price: 24000000,
        image: "Asus ROG Strix G16.jpg",
        description: "Laptop gaming ROG dengan RTX 4070 dan layar 165Hz.",
      },
    ],
  });
  console.log("✅ Seed berhasil ditambahkan!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

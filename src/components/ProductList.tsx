import { wixClientServer } from "@/lib/wixClientServer";
import { products } from "@wix/stores";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import Pagination from "./Pagination";

const PRODUCT_PER_PAGE = 8;
const ProductList = async ({
  categoryId,
  limit = PRODUCT_PER_PAGE,
  searchParams = {},
}: {
  categoryId: string;
  limit?: number;
  searchParams?: any;
}) => {
  const wixClient = await wixClientServer();

  // Ensure searchParams are valid
  const productName = searchParams?.name || "";
  const productType = searchParams?.type ? [searchParams.type] : ["physical", "digital"];
  const minPrice = searchParams?.min || 0;
  const maxPrice = searchParams?.max || 999999;
  const page = searchParams?.page ? parseInt(searchParams.page) : 0;

  const productQuery = wixClient.products
    .queryProducts()
    .startsWith("name", productName)
    .eq("collectionIds", categoryId)
    .hasSome("productType", productType)
    .gt("priceData.price", minPrice)
    .lt("priceData.price", maxPrice)
    .limit(limit)
    .skip(page * limit);

  if (searchParams?.sort) {
    const [sortType, sortBy] = searchParams.sort.split(" ");
    if (sortType === "asc") {
      productQuery.ascending(sortBy);
    } else if (sortType === "desc") {
      productQuery.descending(sortBy);
    }
  }

  try {
    const res = await productQuery.find();
    return (
      <div className="mt-12 flex gap-x-8 gap-y-16 justify-between flex-wrap">
        {res.items.map((product: products.Product) => (
          <Link
            href={"/" + product.slug}
            className="w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]"
            key={product._id}
          >
            <div className="relative w-full h-80">
              <Image
                src={product.media?.mainMedia?.image?.url || "/product.png"}
                alt=""
                fill
                sizes="25vw"
                className="absolute object-cover rounded-md z-10 hover:opacity-0 transition-opacity easy duration-500"
              />
              {product.media?.items && (
                <Image
                  src={product.media?.items[1]?.image?.url || "/product.png"}
                  alt=""
                  fill
                  sizes="25vw"
                  className="absolute object-cover rounded-md"
                />
              )}
            </div>
            <div className="flex justify-between">
              <span className="font-medium">{product.name}</span>
              <span className="font-semibold">${product.price?.price}</span>
            </div>
            {product.additionalInfoSections && (
              <div
                className="text-sm text-gray-500"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    product.additionalInfoSections.find(
                      (section: any) => section.title === "shortDesc"
                    )?.description || ""
                  ),
                }}
              ></div>
            )}
            <button className="rounded-2xl ring-1 ring-lama text-lama w-max py-2 px-4 text-xs hover:bg-lama hover:text-white">
              Add to Cart
            </button>
          </Link>
        ))}
        {searchParams?.cat || searchParams?.name ? (
          <Pagination
            currentPage={res.currentPage || 0}
            hasPrev={res.hasPrev()}
            hasNext={res.hasNext()}
          />
        ) : null}
      </div>
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return <div>Failed to load products. Please try again later.</div>;
  }
};


export default ProductList;

// import { products } from "@wix/stores";
// import Image from "next/image";
// import Link from "next/link";
// import DOMPurify from "isomorphic-dompurify";
// import Pagination from "./Pagination";

// const PRODUCT_PER_PAGE = 8;

// const mockResponse = {
//   items: [
//     {
//       _id: "1",
//       slug: "product-1",
//       name: "Product 1",
//       price: { price: 29.19 },
//       media: {
//         mainMedia: { image: { url: "/images/product1.jpg" } },
//         items: [{}, { image: { url: "/images/product1_alt.jpg" } }],
//       },
//       additionalInfoSections: [
//         { title: "shortDesc", description: "This is a short description of Product 1." },
//       ],
//     },
//     {
//       _id: "2",
//       slug: "product-2",
//       name: "Product 2",
//       price: { price: 49.99 },
//       media: {
//         mainMedia: { image: { url: "/images/product2.jpg" } },
//         items: [{}, { image: { url: "/images/product2_alt.jpg" } }],
//       },
//       additionalInfoSections: [
//         { title: "shortDesc", description: "This is a short description of Product 2." },
//       ],
//     },
//     {
//       _id: "3",
//       slug: "product-3",
//       name: "Product 2",
//       price: { price: 9.99 },
//       media: {
//         mainMedia: { image: { url: "/images/product2.jpg" } },
//         items: [{}, { image: { url: "/images/product2_alt.jpg" } }],
//       },
//       additionalInfoSections: [
//         { title: "shortDesc", description: "This is a short description " },
//       ],
//     },
//     {
//       _id: "4",
//       slug: "product-4",
//       name: "Productizzo 2",
//       price: { price: 4.99 },
//       media: {
//         mainMedia: { image: { url: "/images/product2.jpg" } },
//         items: [{}, { image: { url: "/images/product2_alt.jpg" } }],
//       },
//       additionalInfoSections: [
//         { title: "shortDesc", description: "This is a short description of Product 2." },
//       ],
//     },
//     // Add more mock products as needed
//   ],
//   currentPage: 0,
//   hasPrev: () => false,
//   hasNext: () => true,
// };

// const ProductList = async ({
//   categoryId,
//   limit,
//   searchParams,
// }: {
//   categoryId: string;
//   limit?: number;
//   searchParams?: any;
// }) => {
//   // Use mockResponse instead of making an API call
//   const res = mockResponse;

//   return (
//     <div className="mt-12 flex gap-x-8 gap-y-16 justify-between flex-wrap">
//       {res.items.map((product: products.Product) => (
//         <Link
//           href={"/" + product.slug}
//           className="w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]"
//           key={product._id}
//         >
//           <div className="relative w-full h-80">
//             <Image
//               src={product.media?.mainMedia?.image?.url || "/product.png"}
//               alt=""
//               fill
//               sizes="25vw"
//               className="absolute object-cover rounded-md z-10 hover:opacity-0 transition-opacity ease duration-500"
//             />
//             {product.media?.items && (
//               <Image
//                 src={product.media?.items[1]?.image?.url || "/product.png"}
//                 alt=""
//                 fill
//                 sizes="25vw"
//                 className="absolute object-cover rounded-md"
//               />
//             )}
//           </div>
//           <div className="flex justify-between">
//             <span className="font-medium">{product.name}</span>
//             <span className="font-semibold">${product.price?.price}</span>
//           </div>
//           {product.additionalInfoSections && (
//             <div
//               className="text-sm text-gray-500"
//               dangerouslySetInnerHTML={{
//                 __html: DOMPurify.sanitize(
//                   product.additionalInfoSections.find(
//                     (section: any) => section.title === "shortDesc"
//                   )?.description || ""
//                 ),
//               }}
//             ></div>
//           )}
//           <button className="rounded-2xl ring-1 ring-lama text-lama w-max py-2 px-4 text-xs hover:bg-lama hover:text-white">
//             Add to Cart
//           </button>
//         </Link>
//       ))}
//       {(searchParams?.cat || searchParams?.name) && (
//         <Pagination
//           currentPage={res.currentPage || 0}
//           hasPrev={res.hasPrev()}
//           hasNext={res.hasNext()}
//         />
//       )}
//     </div>
//   );
// };

// export default ProductList;


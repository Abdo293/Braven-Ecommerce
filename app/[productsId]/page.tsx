"use client";
import { useProducts } from "@/hooks/useProducts";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  ShoppingCart,
  ArrowLeft,
  Package,
  Tag,
  CheckCircle,
  XCircle,
  Minus,
  Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useProductsMedia } from "@/hooks/useProductsMedia";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "@/components/styles.css";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTypes } from "@/hooks/useTypes";
import { useShopStore } from "@/store/useShopStore";
import { useOffer } from "@/hooks/useOffers";
import CountdownTimer from "@/components/home/deal-of-week/CountdownTimer";

const PRIMARY = "#16a34a";

type Offer = {
  id: string;
  discount_type: "percentage" | "fixed" | string;
  discount_value: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  applies_to: "product" | "category" | "all" | string;
  category_id?: string | null;
  product_id?: string | null;
};

const isOfferActive = (offer?: Offer | null) => {
  if (!offer || offer.is_active === false) return false;
  const now = Date.now();
  const start = offer.start_date
    ? new Date(offer.start_date).getTime()
    : -Infinity;
  const end = offer.end_date ? new Date(offer.end_date).getTime() : Infinity;
  return now >= start && now <= end;
};

export default function ProductsDetails() {
  const { products } = useProducts();
  const { productsMedia } = useProductsMedia();
  const { categories } = useCategories();
  const { productTypes } = useTypes();
  const { offers } = useOffer();

  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("productDescription");

  const productsId = params.productsId as string;
  const productsDetails = products.find((product) => product.id === productsId);

  const proTypes = productTypes.find(
    (type) => type.id === productsDetails?.type
  );

  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleWishlist, wishlist, openCart } = useShopStore();
  const isWishlisted = wishlist.some((p) => p.id === productsDetails?.id);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const productMedia = productsMedia.filter((m) => m.product_id === productsId);
  const productMediaNoVideos = productMedia.filter(
    (m) => m.file_type !== "video"
  );
  const mainImg = productMedia.find((img) => img.is_main === true);
  const currentDisplayImage = selectedImage || mainImg?.file_url;

  // === احسب أفضل عرض ساري لهذا المنتج ===
  const activeOffers = useMemo(
    () => (offers || []).filter(isOfferActive) as Offer[],
    [offers]
  );

  const bestOfferFor = (product?: any): Offer | null => {
    if (!product) return null;
    const cands = activeOffers.filter((o) => {
      if (o.applies_to === "product") return o.product_id === product.id;
      if (o.applies_to === "category")
        return o.category_id === product.category_id;
      if (o.applies_to === "all") return true;
      return false;
    });
    if (!cands.length) return null;
    const rank = (o: Offer) =>
      o.applies_to === "product" ? 3 : o.applies_to === "category" ? 2 : 1;
    return cands.sort(
      (a, b) =>
        rank(b) - rank(a) || (+b.discount_value || 0) - (+a.discount_value || 0)
    )[0]!;
  };

  const relevantOffer = useMemo(
    () => bestOfferFor(productsDetails),
    [productsDetails, activeOffers]
  );

  const basePrice = Number(productsDetails?.price ?? 0) || 0;
  const { finalPrice, discountPercent } = useMemo(() => {
    if (!relevantOffer) return { finalPrice: basePrice, discountPercent: 0 };
    const val = Number(relevantOffer.discount_value) || 0;
    if (relevantOffer.discount_type === "percentage") {
      const f = Math.max(0, basePrice * (1 - val / 100));
      return { finalPrice: f, discountPercent: Math.round(val) };
    } else {
      const f = Math.max(0, basePrice - val);
      const pct = basePrice > 0 ? Math.round((val / basePrice) * 100) : 0;
      return { finalPrice: f, discountPercent: pct };
    }
  }, [relevantOffer, basePrice]);

  if (!productsDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("productNotFound")}
          </h2>
          <p className="text-gray-600">{t("productDoesntExist")}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("goBack")}
          </Button>
        </div>
      </div>
    );
  }

  const isOutOfStock = productsDetails.quantity === 0;
  const isLowStock =
    productsDetails.quantity > 0 && productsDetails.quantity <= 10;

  const handleQuantityChange = (action: "increase" | "decrease") => {
    if (action === "increase" && quantity < productsDetails.quantity) {
      setQuantity((prev) => prev + 1);
    } else if (action === "decrease" && quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // === Add to cart بالسعر بعد الخصم + حفظ معلومات العرض ===
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(
      {
        id: productsDetails.id,
        name_ar: productsDetails.name_ar,
        name_en: productsDetails.name_en,
        price: Number(finalPrice.toFixed(2)), // ← السعر النهائي
        original_price: basePrice, // للشطب في السلة
        discount_type: relevantOffer?.discount_type ?? null,
        discount_value: relevantOffer?.discount_value ?? null,
        applied_offer_id: relevantOffer?.id ?? null,
        img: currentDisplayImage || "",
        quantity: productsDetails.quantity,
        productType: locale === "en" ? proTypes?.name_en : proTypes?.name_ar,
      } as any,
      quantity
    );
    openCart();
  };

  const handleWishlist = () => {
    toggleWishlist({
      id: productsDetails.id,
      name_ar: productsDetails.name_ar,
      name_en: productsDetails.name_en,
      price: Number(finalPrice.toFixed(2)), // نفس السعر النهائي
      img: currentDisplayImage || "",
      quantity: productsDetails.quantity,
      productType: locale === "en" ? proTypes?.name_en : proTypes?.name_ar,
      original_price: basePrice,
    } as any);
  };

  const productCategory = categories.find(
    (c) => c.id === productsDetails?.category_id
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* بادج الخصم */}
            {relevantOffer && !isOutOfStock && discountPercent > 0 && (
              <span
                className="absolute top-3 left-3 z-10 text-xs font-bold text-white px-2 py-1 rounded-md"
                style={{ backgroundColor: PRIMARY }}
                dir="ltr"
              >
                -{discountPercent}%
              </span>
            )}

            {currentDisplayImage ? (
              <Image
                src={currentDisplayImage}
                alt={
                  locale === "ar"
                    ? productsDetails.name_ar
                    : productsDetails.name_en
                }
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 600px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <Tag className="w-12 h-12 text-gray-500" />
                  </div>
                  <span className="text-gray-500 text-lg font-medium">
                    {t("noImg")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {productMediaNoVideos.length > 1 && (
            <div className="w-full">
              <Swiper
                navigation={true}
                spaceBetween={10}
                slidesPerView={4}
                breakpoints={{
                  640: { slidesPerView: 3 },
                  768: { slidesPerView: 4 },
                  1024: { slidesPerView: 4 },
                }}
                modules={[Navigation]}
                className="mySwiper"
              >
                {productMediaNoVideos.map((media, index) => (
                  <SwiperSlide key={media.id || index}>
                    <div
                      className={`aspect-square bg-white rounded-lg border-2 overflow-hidden cursor-pointer hover:shadow-md transition-all ${
                        currentDisplayImage === media.file_url
                          ? "border-green-500 shadow-md"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(media.file_url)}
                    >
                      <Image
                        src={media.file_url}
                        width={150}
                        height={150}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Title / Type */}
          <div className="space-y-3">
            {productsDetails.type && (
              <Badge variant="secondary" className="text-sm">
                <Tag className="w-3 h-3 mr-1" />
                {locale === "en" ? proTypes?.name_en : proTypes?.name_ar}
              </Badge>
            )}

            <h1
              className={`text-3xl lg:text-4xl font-bold text-gray-900 leading-tight ${
                locale === "ar" ? "text-right" : "text-left"
              }`}
            >
              {locale === "ar"
                ? productsDetails.name_ar
                : productsDetails.name_en}
            </h1>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-3">
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">{t("outOfStck")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">{t("inStock")}</span>
                <span className="text-gray-500">
                  ({productsDetails.quantity} {t("available")})
                </span>
              </div>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge variant="destructive" className="ml-2">
                {t("lowStock")}
              </Badge>
            )}
          </div>

          {/* Price (final + original) */}
          <div
            className={`${locale === "ar" ? "text-right" : "text-left"}`}
            dir="ltr"
          >
            {discountPercent > 0 ? (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  {finalPrice.toFixed(2)}
                </span>
                <span className="text-xl text-gray-600">L.E</span>
                <span className="text-lg text-gray-400 line-through ml-2">
                  {basePrice.toFixed(2)} L.E
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">
                  {basePrice.toFixed(2)}
                </span>
                <span className="text-xl text-gray-600">L.E</span>
              </div>
            )}
          </div>

          {/* Countdown Timer - Show only if there's an active offer with end_date */}
          {relevantOffer && relevantOffer.end_date && (
            <div className="flex items-center justify-center">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  {locale === "ar" ? "انتهى العرض خلال:" : "Offer ends in:"}
                </h3>
                <CountdownTimer endDate={relevantOffer.end_date} />
              </div>
            </div>
          )}

          <Separator />

          {/* Description */}
          {(productsDetails.description_ar ||
            productsDetails.description_en) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("description")}
              </h3>
              <p
                className={`text-gray-700 leading-relaxed ${
                  locale === "ar" ? "text-right" : "text-left"
                }`}
              >
                {locale === "ar"
                  ? productsDetails.description_ar
                  : productsDetails.description_en}
              </p>
            </div>
          )}

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("quantity")}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange("decrease")}
                    disabled={quantity <= 1}
                    className="h-10 w-10 p-0 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-lg">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange("increase")}
                    disabled={quantity >= productsDetails.quantity}
                    className="h-10 w-10 p-0 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="flex-1 h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {isOutOfStock ? t("outOfStck") : t("addToCart")}
              </Button>

              <Button
                variant="outline"
                onClick={handleWishlist}
                className={`h-14 px-6 ${
                  isWishlisted
                    ? "text-red-600 border-red-300 bg-red-50 hover:bg-red-100"
                    : "text-gray-600 border-gray-300 hover:text-red-600 hover:border-red-300"
                }`}
                aria-pressed={isWishlisted}
                aria-label={
                  isWishlisted ? t("removeFromWishlist") : t("addToWishlist")
                }
              >
                <Heart
                  className={`w-5 h-5 ${
                    isWishlisted ? "fill-red-600 text-red-600" : "text-gray-500"
                  }`}
                  strokeWidth={2}
                />
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("productDetails")}
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="font-bold">{t("category")}: </span>
                <span>
                  {locale === "ar"
                    ? productCategory?.name_ar
                    : productCategory?.name_en}
                </span>
              </div>
              <div>
                <span className="font-bold">{t("type")}: </span>
                <span>
                  {locale === "en" ? proTypes?.name_en : proTypes?.name_ar}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos */}
      {productMedia
        .filter((m) => m.file_type === "video")
        .map((media) => (
          <Card key={media.id} className="mt-10">
            <CardHeader className="font-bold text-2xl">
              {t("videos")}
            </CardHeader>
            <CardContent className="text-lg flex items-center justify-center">
              <video
                src={media.file_url}
                controls
                className="w-full max-w-lg"
              />
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

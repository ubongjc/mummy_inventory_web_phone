"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle,
  TrendingUp,
  Truck,
  Package,
  Clock,
  Calendar,
  Shield,
  Instagram,
  Facebook,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

interface Supplier {
  id: string;
  supplier_id: string;
  company_name: string;
  aka_names: string[];
  categories: string[];
  product_examples: string[];
  wholesale_terms: {
    bulk_available: boolean;
    moq_units?: number;
    price_range_hint?: string;
    lead_time_days?: number;
    delivery_options: string[];
    returns_warranty?: string;
  };
  coverage_regions: string[];
  address_text: string | null;
  state: string | null;
  lga_or_city: string | null;
  lat: number | null;
  lon: number | null;
  phones: string[];
  whatsapp: string[];
  emails: string[];
  websites: string[];
  socials: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    others?: string[];
  };
  business_hours: string | null;
  ratings: {
    google?: { stars: number; count: number };
    facebook?: { stars: number; count: number };
  };
  verifications: {
    explicit_wholesale_language: boolean;
    evidence_snippets: string[];
    cac_number?: string;
  };
  confidence: number;
  notes: string | null;
  source_url: string;
  source_platform: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

interface RelatedSupplier {
  id: string;
  company_name: string;
  categories: string[];
  state: string;
  confidence: number;
  similarity_reason?: string;
}

const CATEGORY_LABELS: { [key: string]: string } = {
  seating: "Seating",
  tables: "Tables",
  tents: "Tents & Canopies",
  flooring_grass: "Flooring & Grass",
  linens: "Linens",
  decor: "Decor",
  lighting: "Lighting",
  sound: "Sound Equipment",
  staging_truss: "Staging & Truss",
  catering: "Catering Ware",
  power_generators: "Generators",
  mobile_toilet: "Mobile Toilets",
  bridal_wear: "Bridal Wear",
};

export default function SupplierDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [similarSuppliers, setSimilarSuppliers] = useState<RelatedSupplier[]>([]);
  const [relatedSuppliers, setRelatedSuppliers] = useState<RelatedSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSupplier();
  }, [params.id]);

  const loadSupplier = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/wholesale/suppliers/${params.id}`);

      if (!response.ok) {
        throw new Error("Supplier not found");
      }

      const data = await response.json();
      setSupplier(data.supplier);
      setSimilarSuppliers(data.similar_suppliers || []);
      setRelatedSuppliers(data.related_by_category || []);
    } catch (err) {
      console.error("Error loading supplier:", err);
      setError("Failed to load supplier details. Supplier may not exist.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
          <p className="text-red-700 mb-4">{error || "Supplier not found"}</p>
          <button
            onClick={() => router.push("/wholesale-suppliers")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to suppliers
          </button>
        </div>
      </div>
    );
  }

  const googleRating = supplier.ratings?.google;
  const facebookRating = supplier.ratings?.facebook;
  const hasVerifiedWholesale = supplier.verifications?.explicit_wholesale_language;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.push("/wholesale-suppliers")}
            className="flex items-center gap-2 text-white hover:text-blue-100 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to suppliers
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {supplier.company_name}
              </h1>
              {supplier.aka_names.length > 0 && (
                <p className="text-blue-100">
                  Also known as: {supplier.aka_names.join(", ")}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-bold">
                  {(supplier.confidence * 100).toFixed(0)}%
                </span>
              </div>
              {hasVerifiedWholesale && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Verified Wholesale
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categories & Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Categories & Products</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {supplier.categories.map((cat) => (
                  <span
                    key={cat}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                  >
                    {CATEGORY_LABELS[cat] || cat}
                  </span>
                ))}
              </div>
              {supplier.product_examples.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Products:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {supplier.product_examples.map((product, i) => (
                      <li key={i} className="text-gray-600">
                        {product}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Wholesale Terms */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Wholesale Terms
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supplier.wholesale_terms?.bulk_available && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Bulk Available</span>
                  </div>
                )}
                {supplier.wholesale_terms?.moq_units && (
                  <div>
                    <p className="text-sm text-gray-500">Minimum Order Quantity</p>
                    <p className="font-bold text-gray-900">
                      {supplier.wholesale_terms.moq_units} units
                    </p>
                  </div>
                )}
                {supplier.wholesale_terms?.lead_time_days && (
                  <div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Lead Time
                    </p>
                    <p className="font-bold text-gray-900">
                      {supplier.wholesale_terms.lead_time_days} days
                    </p>
                  </div>
                )}
                {supplier.wholesale_terms?.delivery_options.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Delivery Options
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {supplier.wholesale_terms.delivery_options.map((option) => (
                        <span
                          key={option}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium"
                        >
                          {option.replace("_", " ").toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {supplier.wholesale_terms?.price_range_hint && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Price Range</p>
                    <p className="font-medium text-gray-900">
                      {supplier.wholesale_terms.price_range_hint}
                    </p>
                  </div>
                )}
                {supplier.wholesale_terms?.returns_warranty && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Returns & Warranty</p>
                    <p className="text-gray-700">
                      {supplier.wholesale_terms.returns_warranty}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Wholesale Evidence */}
            {supplier.verifications?.evidence_snippets.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Wholesale Evidence
                </h3>
                <ul className="space-y-2">
                  {supplier.verifications.evidence_snippets.map((snippet, i) => (
                    <li key={i} className="text-sm text-blue-800">
                      • {snippet.replace(/['"]/g, "")}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Ratings */}
            {(googleRating || facebookRating) && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Ratings & Reviews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {googleRating && (
                    <div className="flex items-center gap-3">
                      <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                      <div>
                        <p className="font-bold text-2xl text-gray-900">
                          {googleRating.stars.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Google ({googleRating.count} reviews)
                        </p>
                      </div>
                    </div>
                  )}
                  {facebookRating && (
                    <div className="flex items-center gap-3">
                      <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                      <div>
                        <p className="font-bold text-2xl text-gray-900">
                          {facebookRating.stars.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Facebook ({facebookRating.count} reviews)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-3">
                {supplier.phones.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone
                    </p>
                    {supplier.phones.map((phone, i) => (
                      <a
                        key={i}
                        href={`tel:${phone}`}
                        className="block text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {phone}
                      </a>
                    ))}
                  </div>
                )}
                {supplier.whatsapp.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </p>
                    {supplier.whatsapp.map((wa, i) => (
                      <a
                        key={i}
                        href={`https://wa.me/${wa.replace("+", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-green-600 hover:text-green-700 font-medium"
                      >
                        {wa}
                      </a>
                    ))}
                  </div>
                )}
                {supplier.emails.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email
                    </p>
                    {supplier.emails.map((email, i) => (
                      <a
                        key={i}
                        href={`mailto:${email}`}
                        className="block text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                )}
                {supplier.websites.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Website
                    </p>
                    {supplier.websites.map((site, i) => (
                      <a
                        key={i}
                        href={site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        {site.replace(/^https?:\/\//, "")}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Social Media */}
              {(supplier.socials?.instagram ||
                supplier.socials?.facebook ||
                supplier.socials?.tiktok) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Social Media</p>
                  <div className="flex gap-3">
                    {supplier.socials.instagram && (
                      <a
                        href={supplier.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-pink-600 hover:text-pink-700"
                      >
                        <Instagram className="w-6 h-6" />
                      </a>
                    )}
                    {supplier.socials.facebook && (
                      <a
                        href={supplier.socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Facebook className="w-6 h-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-blue-600" />
                Location
              </h2>
              {supplier.address_text && (
                <p className="text-gray-700 mb-2">{supplier.address_text}</p>
              )}
              {supplier.state && (
                <p className="text-gray-600">
                  {supplier.lga_or_city && `${supplier.lga_or_city}, `}
                  {supplier.state}
                </p>
              )}
              {supplier.coverage_regions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Coverage Areas:</p>
                  <div className="flex flex-wrap gap-2">
                    {supplier.coverage_regions.map((region, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {supplier.business_hours && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">Business Hours:</p>
                  <p className="text-gray-700">{supplier.business_hours}</p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="bg-gray-100 rounded-lg p-4 text-sm">
              <p className="text-gray-600 flex items-center gap-1 mb-1">
                <Calendar className="w-4 h-4" />
                Last verified: {new Date(supplier.last_seen_at).toLocaleDateString()}
              </p>
              {supplier.verifications?.cac_number && (
                <p className="text-gray-600">CAC: {supplier.verifications.cac_number}</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Suppliers */}
        {(similarSuppliers.length > 0 || relatedSuppliers.length > 0) && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Related Suppliers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...similarSuppliers, ...relatedSuppliers].slice(0, 6).map((related) => (
                <div
                  key={related.id}
                  onClick={() => router.push(`/wholesale-suppliers/${related.id}`)}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <h3 className="font-bold text-gray-900 mb-2">
                    {related.company_name}
                  </h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {related.categories.slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs"
                      >
                        {CATEGORY_LABELS[cat] || cat}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{related.state}</p>
                  {related.similarity_reason && (
                    <p className="text-xs text-gray-500 mt-2">
                      {related.similarity_reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

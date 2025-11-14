"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Calendar from "../components/Calendar";
import DayDrawer from "../components/DayDrawer";
import AddItemModal from "../components/AddItemModal";
import AddBookingModal from "../components/AddBookingModal";
import CheckAvailabilityModal from "../components/CheckAvailabilityModal";
import { CalendarDays, Package, Plus, Settings, Menu, X, Filter, CheckSquare, Square, Search, Star, Shield, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface Item {
  id: string;
  name: string;
  unit: string;
  totalQuantity: number;
}

interface ItemReservation {
  itemId: string;
  reserved: number;
}

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  businessName: string | null;
  logoUrl: string | null;
  role: string;
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddBookingModalOpen, setIsAddBookingModalOpen] = useState(false);
  const [isCheckAvailabilityOpen, setIsCheckAvailabilityOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isItemFilterOpen, setIsItemFilterOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [itemSortBy, setItemSortBy] = useState<"name-asc" | "name-desc" | "quantity-desc" | "quantity-asc" | "unit">("name-asc");
  const [itemReservations, setItemReservations] = useState<Map<string, number>>(new Map());
  const [calendarDateRange, setCalendarDateRange] = useState<{ start: string; end: string } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Fetch items and user profile on mount
  useEffect(() => {
    fetchItems();
    fetchUserProfile();
  }, [refreshKey]);

  // Refresh user profile when page becomes visible (e.g., navigating back from settings)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUserProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch("/api/items");
      const data = await response.json();
      setItems(data);
      // Select all items by default
      setSelectedItemIds(data.map((item: Item) => item.id));
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        cache: 'no-store', // Prevent caching to always get fresh data
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        console.log("User profile loaded:", data.businessName || "No business name set");
      } else if (response.status === 401) {
        console.log("User not authenticated - personalization features unavailable");
      } else {
        console.error("Failed to fetch user profile:", response.status);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchItemReservations = async (start: string, end: string) => {
    try {
      const response = await fetch(`/api/availability/summary?start=${start}&end=${end}`);
      const data: ItemReservation[] = await response.json();
      const reservationMap = new Map<string, number>();
      data.forEach((item) => {
        reservationMap.set(item.itemId, item.reserved);
      });
      setItemReservations(reservationMap);
    } catch (error) {
      console.error("Error fetching item reservations:", error);
    }
  };

  // Fetch reservations when calendar date range changes
  useEffect(() => {
    if (calendarDateRange) {
      fetchItemReservations(calendarDateRange.start, calendarDateRange.end);
    }
  }, [calendarDateRange, refreshKey]);

  const toggleItem = (itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAllItems = () => {
    setSelectedItemIds(items.map(item => item.id));
  };

  const deselectAllItems = () => {
    setSelectedItemIds([]);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleItemAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleBookingAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDataChange = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Menu Overlays */}
      {(isMenuOpen || isItemFilterOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            setIsMenuOpen(false);
            setIsItemFilterOpen(false);
          }}
        />
      )}

      {/* Main Menu (Actions) */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
            <h2 className="text-lg font-bold text-white">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsAddItemModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 font-semibold shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Item
              </button>

              <button
                onClick={() => {
                  setIsAddBookingModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 font-semibold shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                New Booking
              </button>

              <Link
                href="/bookings"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 font-semibold shadow-lg transition-all"
              >
                <CalendarDays className="w-5 h-5" />
                All Bookings
              </Link>

              <Link
                href="/inventory"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl hover:from-gray-800 hover:to-black font-semibold shadow-lg transition-all"
              >
                <Package className="w-5 h-5" />
                Inventory
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 font-semibold shadow-lg transition-all"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>

              {/* Admin Panel - Only visible to admin users */}
              {userProfile?.role === 'admin' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl hover:from-red-700 hover:to-rose-800 font-semibold shadow-lg transition-all"
                >
                  <Shield className="w-5 h-5" />
                  Admin Dashboard
                </Link>
              )}

              {/* Separator */}
              <div className="py-2">
                <div className="border-t border-gray-300"></div>
              </div>

              <Link
                href="/premium"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl hover:from-yellow-600 hover:to-amber-700 font-semibold shadow-lg transition-all"
              >
                <Star className="w-5 h-5 fill-yellow-300" />
                Premium Features
              </Link>

              {/* Separator */}
              <div className="py-2">
                <div className="border-t border-gray-300"></div>
              </div>

              <button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-700 text-white rounded-xl hover:from-gray-600 hover:to-gray-800 font-semibold shadow-lg transition-all"
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Item Filter Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isItemFilterOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
            <h2 className="text-lg font-bold text-white">Filter Calendar by Items</h2>
            <button
              onClick={() => setIsItemFilterOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filter Controls */}
          <div className="px-3 py-2 border-b border-gray-200 space-y-2">
            <div className="flex gap-2">
              <button
                onClick={selectAllItems}
                className="flex-1 px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors text-xs"
              >
                Select All
              </button>
              <button
                onClick={deselectAllItems}
                className="flex-1 px-2 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors text-xs"
              >
                Deselect All
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[10px] text-gray-600 font-medium">
                {selectedItemIds.length} of {items.length} items selected
              </div>
              <select
                value={itemSortBy}
                onChange={(e) => setItemSortBy(e.target.value as "name-asc" | "name-desc" | "quantity-desc" | "quantity-asc" | "unit")}
                className="px-2 py-1 border border-gray-300 rounded-lg text-[10px] font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="quantity-desc">Qty: High-Low</option>
                <option value="quantity-asc">Qty: Low-High</option>
                <option value="unit">Unit: A-Z</option>
              </select>
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                No items yet
              </div>
            ) : (() => {
                // Filter and sort items
                const filteredItems = items
                  .filter(item =>
                    item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
                  )
                  .sort((a, b) => {
                    switch (itemSortBy) {
                      case "name-asc":
                        return a.name.localeCompare(b.name);
                      case "name-desc":
                        return b.name.localeCompare(a.name);
                      case "quantity-desc":
                        return b.totalQuantity - a.totalQuantity;
                      case "quantity-asc":
                        return a.totalQuantity - b.totalQuantity;
                      case "unit":
                        return a.unit.localeCompare(b.unit);
                      default:
                        return a.name.localeCompare(b.name);
                    }
                  });

                if (filteredItems.length === 0) {
                  return (
                    <div className="text-center text-gray-500 py-8 text-sm">
                      No items match your search
                    </div>
                  );
                }

                return (
                  <div className="space-y-1">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className={`w-full flex items-center gap-1.5 p-1.5 rounded-lg border transition-all ${
                          selectedItemIds.includes(item.id)
                            ? "bg-blue-50 border-blue-500"
                            : "bg-white border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {selectedItemIds.includes(item.id) ? (
                          <CheckSquare className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-bold text-black text-[10px] leading-tight break-words">
                            <span className="break-all">{item.name}</span>
                            {itemReservations.has(item.id) && itemReservations.get(item.id)! > 0 && (
                              <span className="text-orange-600 ml-1 whitespace-normal">
                                ({itemReservations.get(item.id)} currently booked)
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-gray-600">
                            {item.totalQuantity} {item.unit} total
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                );
              })()
            }
          </div>
        </div>
      </div>

      {/* Compact Header */}
      <header className="bg-white shadow-lg border-b-2 border-gradient flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Menu buttons stacked vertically */}
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Main Menu"
                >
                  <Menu className="w-5 h-5 text-gray-700" />
                </button>
                <button
                  onClick={() => setIsItemFilterOpen(true)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Filter Calendar by Items"
                >
                  <Package className="w-5 h-5 text-blue-600" />
                </button>
              </div>

              <div className="relative w-10 h-10 rounded-xl shadow-lg overflow-hidden flex-shrink-0">
                {userProfile?.logoUrl ? (
                  <img
                    src={userProfile.logoUrl}
                    alt="Company Logo"
                    className="w-full h-full object-contain bg-white"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-sm md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Hi {userProfile?.businessName || "there"}!
                </h2>
                <p className="text-[10px] md:text-xs text-gray-600 font-medium">
                  Manage your bookings with ease
                </p>
              </div>
            </div>

            {/* Right side - App Title with Premium Link */}
            <Link
              href="/premium"
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              title="Premium Features"
            >
              <h1 className="text-sm md:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                Very Simple Inventory
              </h1>
              <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-400 flex-shrink-0" />
            </Link>
          </div>
          {/* Check Availability Button */}
          <div className="mt-2">
            <button
              onClick={() => setIsCheckAvailabilityOpen(true)}
              className="w-full px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 font-semibold shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">⚡ CHECK ITEM AVAILABILITY</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full height calendar */}
      <main className="flex-1 w-full mx-auto px-4 py-4">
        <div className="h-full max-w-7xl mx-auto">
          {/* Calendar - Full Width */}
          <Calendar
            key={refreshKey}
            onDateClick={handleDateClick}
            selectedItemIds={selectedItemIds}
            onDateRangeChange={(start, end) => setCalendarDateRange({ start, end })}
          />
        </div>
      </main>

      {/* Day Drawer */}
      <DayDrawer
        date={selectedDate}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        selectedItemIds={selectedItemIds}
        onDataChange={handleDataChange}
      />

      {/* Modals */}
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onSuccess={handleItemAdded}
      />
      <AddBookingModal
        isOpen={isAddBookingModalOpen}
        onClose={() => setIsAddBookingModalOpen(false)}
        onSuccess={handleBookingAdded}
      />
      <CheckAvailabilityModal
        isOpen={isCheckAvailabilityOpen}
        onClose={() => setIsCheckAvailabilityOpen(false)}
      />
    </div>
  );
}

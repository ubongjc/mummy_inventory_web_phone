"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Package, Users, AlertTriangle, Search, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import InventorySummary from "../components/InventorySummary";
import NotesDisplay from "../components/NotesDisplay";
import NotesModal from "../components/NotesModal";
import { useSettings } from "@/app/hooks/useSettings";
import { toTitleCase } from "@/app/lib/validation";

interface Item {
  id: string;
  name: string;
  unit: string;
  totalQuantity: number;
  price?: number;
  notes?: string;
}

interface Customer {
  id: string;
  name: string; // For backward compatibility
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"items" | "customers">("items");
  const [items, setItems] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showItemSummary, setShowItemSummary] = useState(false);

  // Search states
  const [itemSearch, setItemSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  // Sort states
  const [itemSortBy, setItemSortBy] = useState<"name" | "quantity" | "price" | "unit">("name");
  const [customerSortBy, setCustomerSortBy] = useState<"name" | "email" | "phone">("name");

  // Expanded customer rows
  const [expandedCustomerIds, setExpandedCustomerIds] = useState<Set<string>>(new Set());

  // Notes modal states
  const [itemNotesModalOpen, setItemNotesModalOpen] = useState(false);
  const [currentItemNotes, setCurrentItemNotes] = useState<{ id: string; notes: string } | null>(null);
  const [customerNotesModalOpen, setCustomerNotesModalOpen] = useState(false);
  const [currentCustomerNotes, setCurrentCustomerNotes] = useState<{ id: string; notes: string } | null>(null);

  const toggleCustomerExpand = (id: string) => {
    const newExpanded = new Set(expandedCustomerIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCustomerIds(newExpanded);
  };

  const expandAllCustomers = () => {
    setExpandedCustomerIds(new Set(getFilteredAndSortedCustomers().map(c => c.id)));
  };

  const collapseAllCustomers = () => {
    setExpandedCustomerIds(new Set());
  };

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "items" | "customers" | "all";
    title: string;
    message: string;
    count: number;
  }>({
    isOpen: false,
    type: "items",
    title: "",
    message: "",
    count: 0,
  });

  const { formatCurrency } = useSettings();

  useEffect(() => {
    fetchItems();
    fetchCustomers();
  }, []);

  const fetchItems = async () => {
    const response = await fetch("/api/items");
    const data = await response.json();
    setItems(data);
  };

  const fetchCustomers = async () => {
    const response = await fetch("/api/customers");
    const data = await response.json();
    setCustomers(data);
  };

  const handleEdit = (id: string, data: any) => {
    setEditingId(id);
    setEditData(data);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveItem = async (id: string) => {
    try {
      const dataToSave: any = {};

      // Only include fields that have valid values
      // Name - must not be empty
      if (editData.name !== undefined && editData.name.trim() !== "") {
        dataToSave.name = toTitleCase(editData.name);
      }

      // Unit - must not be empty
      if (editData.unit !== undefined && editData.unit.trim() !== "") {
        dataToSave.unit = editData.unit;
      }

      // Total Quantity - must be a valid number
      if (editData.totalQuantity !== undefined) {
        const qty = typeof editData.totalQuantity === 'number' ? editData.totalQuantity : parseInt(editData.totalQuantity);
        if (isNaN(qty) || qty < 0) {
          alert("Please enter a valid quantity (0 or greater)");
          return;
        }
        dataToSave.totalQuantity = qty;
      }

      // Price - optional, but must be valid number if provided
      if (editData.price !== undefined && editData.price !== null && editData.price !== "") {
        const priceVal = typeof editData.price === 'number' ? editData.price : parseFloat(editData.price as string);
        if (!isNaN(priceVal) && priceVal >= 0) {
          dataToSave.price = priceVal;
        }
      }

      // Notes - optional, can be empty
      if (editData.notes !== undefined) {
        dataToSave.notes = editData.notes || "";
      }

      // Ensure we're actually sending some data
      if (Object.keys(dataToSave).length === 0) {
        alert("No changes to save");
        return;
      }

      const response = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating item:", errorData);
        alert(`Failed to update item: ${errorData.error || 'Unknown error'}`);
        return;
      }

      // Successfully saved, now refresh the item list
      await fetchItems();
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error("Error updating item:", error);
      alert(`Failed to update item: ${error}`);
    }
  };

  const handleSaveCustomer = async (id: string) => {
    try {
      const dataToSave = { ...editData };
      if (dataToSave.firstName) {
        dataToSave.firstName = toTitleCase(dataToSave.firstName);
      }
      if (dataToSave.lastName) {
        dataToSave.lastName = toTitleCase(dataToSave.lastName);
      }
      if (dataToSave.address) {
        dataToSave.address = toTitleCase(dataToSave.address);
      }

      const response = await fetch(`/api/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating customer:", errorData);
        alert(`Failed to update customer: ${errorData.error || 'Unknown error'}`);
        return;
      }

      // Successfully saved, now refresh the customer list
      await fetchCustomers();
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error("Error updating customer:", error);
      alert(`Failed to update customer: ${error}`);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete item");
      }
      await fetchItems();
    } catch (error: any) {
      console.error("Error deleting item:", error);
      alert(`Failed to delete item: ${error.message}`);
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const response = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to delete customer");
      }
      await fetchCustomers();
    } catch (error: any) {
      console.error("Error deleting customer:", error);
      alert(`Failed to delete customer: ${error.message}`);
    }
  };

  // Notes handlers
  const handleOpenItemNotes = (item: Item) => {
    setCurrentItemNotes({ id: item.id, notes: item.notes || "" });
    setItemNotesModalOpen(true);
  };

  const handleSaveItemNotes = async (notes: string) => {
    if (!currentItemNotes) {
      throw new Error("No item selected");
    }

    const response = await fetch(`/api/items/${currentItemNotes.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error("Failed to update item notes");
    }

    await fetchItems();
    // Modal will close itself and trigger onClose which resets state
  };

  const handleOpenCustomerNotes = (customer: Customer) => {
    setCurrentCustomerNotes({ id: customer.id, notes: customer.notes || "" });
    setCustomerNotesModalOpen(true);
  };

  const handleSaveCustomerNotes = async (notes: string) => {
    if (!currentCustomerNotes) {
      throw new Error("No customer selected");
    }

    const response = await fetch(`/api/customers/${currentCustomerNotes.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error("Failed to update customer notes");
    }

    await fetchCustomers();
    // Modal will close itself and trigger onClose which resets state
  };

  // Filter and sort functions
  const getFilteredAndSortedItems = () => {
    let filtered = [...items];

    // Apply search filter
    if (itemSearch) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.unit.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.notes?.toLowerCase().includes(itemSearch.toLowerCase())
      );
    }

    // Apply sorting
    switch (itemSortBy) {
      case "name":
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case "quantity":
        return filtered.sort((a, b) => b.totalQuantity - a.totalQuantity);
      case "price":
        return filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "unit":
        return filtered.sort((a, b) => a.unit.localeCompare(b.unit));
      default:
        return filtered;
    }
  };

  const getFilteredAndSortedCustomers = () => {
    let filtered = [...customers];

    // Apply search filter
    if (customerSearch) {
      filtered = filtered.filter((customer) => {
        const fullName = `${customer.firstName || customer.name} ${customer.lastName || ""}`.trim();
        return fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(customerSearch.toLowerCase()) ||
          customer.address?.toLowerCase().includes(customerSearch.toLowerCase());
      });
    }

    // Apply sorting
    switch (customerSortBy) {
      case "name":
        return filtered.sort((a, b) => {
          const aName = `${a.firstName || a.name} ${a.lastName || ""}`.trim();
          const bName = `${b.firstName || b.name} ${b.lastName || ""}`.trim();
          return aName.localeCompare(bName);
        });
      case "email":
        return filtered.sort((a, b) => (a.email || "").localeCompare(b.email || ""));
      case "phone":
        return filtered.sort((a, b) => (a.phone || "").localeCompare(b.phone || ""));
      default:
        return filtered;
    }
  };

  const handleOpenDeleteModal = (type: "items" | "customers" | "all") => {
    let title = "";
    let message = "";
    let count = 0;

    switch (type) {
      case "items":
        title = "Delete All Items";
        message = "This will permanently delete all items from your inventory.";
        count = items.length;
        break;
      case "customers":
        title = "Delete All Customers";
        message = "This will permanently delete all customers.";
        count = customers.length;
        break;
      case "all":
        title = "Delete Everything";
        message = "This will permanently delete ALL items and customers. This action cannot be undone!";
        count = items.length + customers.length;
        break;
    }

    setDeleteModal({ isOpen: true, type, title, message, count });
  };

  const handleConfirmDelete = async () => {
    try {
      let endpoint = "";
      switch (deleteModal.type) {
        case "items":
          endpoint = "/api/items/bulk";
          break;
        case "customers":
          endpoint = "/api/customers/bulk";
          break;
        case "all":
          endpoint = "/api/clear-all";
          break;
      }

      const response = await fetch(endpoint, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      // Refresh all data
      await fetchItems();
      await fetchCustomers();

      alert(`Successfully deleted ${deleteModal.type === "all" ? "all data" : `all ${deleteModal.type}`}`);
      setDeleteModal({ ...deleteModal, isOpen: false });
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white rounded-lg font-semibold transition-all duration-200 shadow-md text-xs"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </Link>
              <Package className="w-5 h-5 text-blue-600" />
              <h1 className="text-sm font-bold text-black">
                Inventory
              </h1>
            </div>
            <button
              onClick={() => handleOpenDeleteModal("all")}
              disabled={items.length === 0 && customers.length === 0}
              className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
            >
              <AlertTriangle className="w-3 h-3" />
              Clear Everything
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 py-2">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-0.5 mb-2 inline-flex">
          <button
            onClick={() => setActiveTab("items")}
            className={`px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 text-xs ${
              activeTab === "items"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Package className="w-3 h-3" />
            Items ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 text-xs ${
              activeTab === "customers"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="w-3 h-3" />
            Customers ({customers.length})
          </button>
        </div>

        {/* Items Tab */}
        {activeTab === "items" && (
          <div className="space-y-2">
            {/* Item Summary Button */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setShowItemSummary(!showItemSummary)}
                className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 font-semibold shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Package className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">📊 ITEM SUMMARY</span>
                {showItemSummary ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
              </button>
              {showItemSummary && (
                <div className="border-t border-gray-200">
                  <InventorySummary />
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-bold text-black">Items ({getFilteredAndSortedItems().length})</h2>
                <button
                  onClick={() => handleOpenDeleteModal("items")}
                  disabled={items.length === 0}
                  className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[10px]"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All Items
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-medium text-xs"
                  />
                </div>
                <select
                  value={itemSortBy}
                  onChange={(e) => setItemSortBy(e.target.value as any)}
                  className="px-2 py-1 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-[10px]"
                >
                  <option value="name">Name</option>
                  <option value="quantity">Qty</option>
                  <option value="price">Price</option>
                  <option value="unit">Unit</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-[9px] font-bold text-black uppercase">
                    Name
                  </th>
                  <th className="px-2 py-1 text-left text-[9px] font-bold text-black uppercase">
                    Unit
                  </th>
                  <th className="px-2 py-1 text-left text-[9px] font-bold text-black uppercase">
                    Qty
                  </th>
                  <th className="px-2 py-1 text-left text-[9px] font-bold text-black uppercase">
                    Price
                  </th>
                  <th className="px-2 py-1 text-left text-[9px] font-bold text-black uppercase">
                    Notes
                  </th>
                  <th className="px-2 py-1 text-right text-[9px] font-bold text-black uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredAndSortedItems().map((item) => (
                  <tr key={item.id}>
                    {editingId === item.id ? (
                      <>
                        <td className="px-2 py-1">
                          <input
                            type="text"
                            value={editData.name ?? item.name}
                            onChange={(e) =>
                              setEditData({ ...editData, name: e.target.value })
                            }
                            maxLength={50}
                            className="w-full px-1 py-0.5 border border-gray-400 rounded text-black font-semibold text-[10px]"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="text"
                            value={editData.unit ?? item.unit}
                            onChange={(e) =>
                              setEditData({ ...editData, unit: e.target.value.toLowerCase() })
                            }
                            onKeyPress={(e) => {
                              // Prevent numbers and uppercase letters from being typed
                              if (/[0-9A-Z]/.test(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            className="w-full px-1 py-0.5 border border-gray-400 rounded text-black font-semibold text-[10px]"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            value={editData.totalQuantity ?? item.totalQuantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                setEditData({ ...editData, totalQuantity: "" });
                              } else {
                                const numVal = parseInt(val);
                                if (!isNaN(numVal) && numVal >= 0) {
                                  setEditData({ ...editData, totalQuantity: numVal });
                                }
                              }
                            }}
                            onBlur={(e) => {
                              // Set to item's original value if empty on blur
                              if (e.target.value === "") {
                                setEditData({ ...editData, totalQuantity: item.totalQuantity });
                              }
                            }}
                            className="w-full px-1 py-0.5 border border-gray-400 rounded text-black font-semibold text-[10px]"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            value={editData.price ?? item.price ?? ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                price: e.target.value ? parseFloat(e.target.value) : undefined,
                              })
                            }
                            placeholder="0.00"
                            step="0.01"
                            className="w-full px-1 py-0.5 border border-gray-400 rounded text-black font-semibold text-[10px]"
                          />
                        </td>
                        <td className="px-2 py-1">
                          <input
                            type="text"
                            value={editData.notes ?? item.notes ?? ""}
                            onChange={(e) =>
                              setEditData({ ...editData, notes: e.target.value })
                            }
                            maxLength={50}
                            className="w-full px-1 py-0.5 border border-gray-400 rounded text-black font-semibold text-[10px]"
                          />
                          <p className="text-[9px] text-gray-600 mt-0.5">
                            {(editData.notes ?? item.notes ?? "").length}/50
                          </p>
                        </td>
                        <td className="px-2 py-1 text-right space-x-1">
                          <button
                            onClick={() => handleSaveItem(item.id)}
                            className="text-green-600 hover:text-green-800 text-[9px] font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-800 text-[9px] font-bold"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-1 font-bold text-black text-[10px] max-w-[150px]">
                          <div className="truncate" title={item.name}>{item.name}</div>
                        </td>
                        <td className="px-2 py-1 font-semibold text-black text-[10px]">{item.unit}</td>
                        <td className="px-2 py-1 font-semibold text-black text-[10px]">{item.totalQuantity}</td>
                        <td className="px-2 py-1 font-semibold text-green-700 text-[10px]">
                          {item.price ? formatCurrency(item.price) : "-"}
                        </td>
                        <td className="px-2 py-1 text-black text-[9px] font-medium max-w-[120px]">
                          <NotesDisplay
                            notes={item.notes || ""}
                            onClick={() => handleOpenItemNotes(item)}
                          />
                        </td>
                        <td className="px-2 py-1 text-right space-x-1">
                          <button
                            onClick={() => handleEdit(item.id, item)}
                            className="px-1 py-0.5 text-[9px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded transition-colors"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-1 py-0.5 text-[9px] font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors"
                          >
                            DEL
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {getFilteredAndSortedItems().length === 0 && (
              <div className="text-center py-6 text-black font-semibold text-xs">
                {items.length === 0
                  ? "No items yet."
                  : "No items match your search."}
              </div>
            )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xs font-bold text-black">Customers ({getFilteredAndSortedCustomers().length})</h2>
                <div className="flex gap-2">
                  <button
                    onClick={expandAllCustomers}
                    className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors text-[10px]"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAllCustomers}
                    className="px-2 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors text-[10px]"
                  >
                    Collapse All
                  </button>
                  <button
                    onClick={() => handleOpenDeleteModal("customers")}
                    disabled={customers.length === 0}
                    className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[10px]"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-medium text-xs"
                  />
                </div>
                <select
                  value={customerSortBy}
                  onChange={(e) => setCustomerSortBy(e.target.value as any)}
                  className="px-2 py-1 border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black font-semibold text-[10px]"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-1 text-left text-[9px] font-bold text-black uppercase">
                    First Name
                  </th>
                  <th className="px-2 py-1 text-left text-[9px] font-bold text-black uppercase">
                    Last Name
                  </th>
                  <th className="px-2 py-1 text-right text-[9px] font-bold text-black uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredAndSortedCustomers().map((customer) => {
                  const isExpanded = expandedCustomerIds.has(customer.id);
                  const isEditing = editingId === customer.id;

                  return (
                    <React.Fragment key={customer.id}>
                      <tr
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => !isEditing && toggleCustomerExpand(customer.id)}
                      >
                        <td className="px-2 py-1 font-bold text-black text-[10px]">
                          <div className="flex items-center gap-1">
                            {isExpanded ? (
                              <ChevronDown className="w-3 h-3 text-blue-600 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            )}
                            <span>{customer.firstName || customer.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1 font-bold text-black text-[10px]">
                          {customer.lastName || "-"}
                        </td>
                        <td className="px-2 py-1 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Ensure customer card is expanded before editing
                              if (!expandedCustomerIds.has(customer.id)) {
                                const newExpanded = new Set(expandedCustomerIds);
                                newExpanded.add(customer.id);
                                setExpandedCustomerIds(newExpanded);
                              }
                              handleEdit(customer.id, customer);
                            }}
                            className="px-1 py-0.5 text-[9px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 border border-blue-600 rounded transition-colors"
                          >
                            EDIT
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCustomer(customer.id);
                            }}
                            className="px-1 py-0.5 text-[9px] font-bold text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded transition-colors"
                          >
                            DEL
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-500">
                          <td colSpan={3} className="px-4 py-3 border-t-2 border-b-4 border-blue-200">
                            {isEditing ? (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[9px] font-bold text-gray-700">First Name</label>
                                    <input
                                      type="text"
                                      value={editData.firstName ?? customer.firstName ?? customer.name ?? ""}
                                      onChange={(e) =>
                                        setEditData({ ...editData, firstName: e.target.value })
                                      }
                                      placeholder="First Name"
                                      className="w-full px-2 py-1 border border-gray-400 rounded text-black font-semibold text-[10px]"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[9px] font-bold text-gray-700">Last Name</label>
                                    <input
                                      type="text"
                                      value={editData.lastName ?? customer.lastName ?? ""}
                                      onChange={(e) =>
                                        setEditData({ ...editData, lastName: e.target.value })
                                      }
                                      placeholder="Last Name"
                                      className="w-full px-2 py-1 border border-gray-400 rounded text-black font-semibold text-[10px]"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-gray-700">Phone</label>
                                  <input
                                    type="text"
                                    value={editData.phone ?? customer.phone ?? ""}
                                    onChange={(e) =>
                                      setEditData({ ...editData, phone: e.target.value })
                                    }
                                    className="w-full px-2 py-1 border border-gray-400 rounded text-black font-semibold text-[10px]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-gray-700">Email</label>
                                  <input
                                    type="email"
                                    value={editData.email ?? customer.email ?? ""}
                                    onChange={(e) =>
                                      setEditData({ ...editData, email: e.target.value })
                                    }
                                    className="w-full px-2 py-1 border border-gray-400 rounded text-black font-semibold text-[10px]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-gray-700">Address</label>
                                  <input
                                    type="text"
                                    value={editData.address ?? customer.address ?? ""}
                                    onChange={(e) =>
                                      setEditData({ ...editData, address: e.target.value })
                                    }
                                    className="w-full px-2 py-1 border border-gray-400 rounded text-black font-semibold text-[10px]"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-gray-700">Notes</label>
                                  <textarea
                                    value={editData.notes ?? customer.notes ?? ""}
                                    onChange={(e) =>
                                      setEditData({ ...editData, notes: e.target.value })
                                    }
                                    maxLength={50}
                                    className="w-full px-2 py-1 border border-gray-400 rounded text-black font-semibold text-[10px]"
                                    rows={2}
                                  />
                                  <p className="text-[9px] text-gray-600 mt-0.5">
                                    {(editData.notes ?? customer.notes ?? "").length}/50 characters
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveCustomer(customer.id)}
                                    className="px-3 py-1 text-[10px] font-bold text-white bg-green-600 hover:bg-green-700 rounded transition-colors"
                                  >
                                    SAVE
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 text-[10px] font-bold text-white bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                                  >
                                    CANCEL
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {/* Contact Information */}
                                {(customer.phone || customer.email) && (
                                  <div className="bg-blue-50 rounded p-2 border border-blue-200">
                                    <div className="text-[9px] text-gray-600 font-bold mb-1">CONTACT</div>
                                    {customer.phone && (
                                      <div className="text-[10px] text-black font-medium mb-0.5">
                                        📞 {customer.phone}
                                      </div>
                                    )}
                                    {customer.email && (
                                      <div className="text-[10px] text-black font-medium">
                                        ✉️ {customer.email}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Address */}
                                {customer.address && (
                                  <div className="bg-green-50 rounded p-2 border border-green-200">
                                    <div className="text-[9px] text-gray-600 font-bold mb-1">ADDRESS</div>
                                    <div className="text-[10px] text-black font-medium">
                                      📍 {customer.address}
                                    </div>
                                  </div>
                                )}

                                {/* Notes */}
                                <div className="bg-purple-50 rounded p-2 border border-purple-200">
                                  <div className="text-[9px] text-gray-600 font-bold mb-1">NOTES</div>
                                  <NotesDisplay
                                    notes={customer.notes || ""}
                                    onClick={() => handleOpenCustomerNotes(customer)}
                                  />
                                </div>

                                {!customer.phone && !customer.email && !customer.address && !customer.notes && (
                                  <div className="text-gray-500 italic text-xs text-center py-2">No additional details</div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            </div>
            {getFilteredAndSortedCustomers().length === 0 && (
              <div className="text-center py-6 text-black font-semibold text-xs">
                {customers.length === 0
                  ? "No customers yet."
                  : "No customers match your search."}
              </div>
            )}
          </div>
        )}

      </main>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleConfirmDelete}
        title={deleteModal.title}
        message={deleteModal.message}
        itemCount={deleteModal.count}
      />

      {/* Item Notes Modal */}
      <NotesModal
        isOpen={itemNotesModalOpen}
        onClose={() => {
          setItemNotesModalOpen(false);
          setCurrentItemNotes(null);
        }}
        initialNotes={currentItemNotes?.notes || ""}
        onSave={handleSaveItemNotes}
        title="Item Notes"
      />

      {/* Customer Notes Modal */}
      <NotesModal
        isOpen={customerNotesModalOpen}
        onClose={() => {
          setCustomerNotesModalOpen(false);
          setCurrentCustomerNotes(null);
        }}
        initialNotes={currentCustomerNotes?.notes || ""}
        onSave={handleSaveCustomerNotes}
        title="Customer Notes"
      />
    </div>
  );
}

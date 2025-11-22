import { useEffect, useState } from "react";

interface Settings {
  id: string;
  businessName: string;
  currency: string;
  currencySymbol: string;
  businessPhone: string | null;
  businessEmail: string | null;
  businessAddress: string | null;
  taxRate: number;
  taxEnabled: boolean;
  taxInclusive: boolean;
  lowStockThreshold: number;
  defaultRentalDays: number;
  dateFormat: string;
  timezone: string;
  updatedAt: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data = await response.json();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null | undefined | any): string => {
    if (amount === null || amount === undefined) {
      return "-";
    }
    // Convert Decimal objects to numbers
    const numAmount = typeof amount === 'number' ? amount : Number(amount);
    if (!settings) {
      return `$${numAmount.toFixed(2)}`;
    }
    return `${settings.currencySymbol}${numAmount.toFixed(2)}`;
  };

  return {
    settings,
    loading,
    error,
    formatCurrency,
    refetch: fetchSettings,
  };
}

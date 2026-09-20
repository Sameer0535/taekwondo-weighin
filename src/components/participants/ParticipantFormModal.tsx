"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Participant } from "@/types";

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  participantToEdit?: Participant | null;
}

export const ParticipantFormModal: React.FC<ParticipantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  participantToEdit,
}) => {
  const isEditing = !!participantToEdit;

  const [formData, setFormData] = useState({
    lotNumber: "",
    athleteName: "",
    academyName: "",
    gender: "MALE",
    division: "Senior",
    ageGroup: "18+",
    category: "Kyorugi",
    weightCategory: "Under 54 KG",
    athleteId: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (participantToEdit) {
      setFormData({
        lotNumber: participantToEdit.lotNumber || "",
        athleteName: participantToEdit.athleteName || "",
        academyName: participantToEdit.academyName || "",
        gender: participantToEdit.gender || "MALE",
        division: participantToEdit.division || "Senior",
        ageGroup: participantToEdit.ageGroup || "18+",
        category: participantToEdit.category || "Kyorugi",
        weightCategory: participantToEdit.weightCategory || "Under 54 KG",
        athleteId: participantToEdit.athleteId || "",
      });
    } else {
      setFormData({
        lotNumber: "",
        athleteName: "",
        academyName: "",
        gender: "MALE",
        division: "Senior",
        ageGroup: "18+",
        category: "Kyorugi",
        weightCategory: "Under 54 KG",
        athleteId: "",
      });
    }
    setErrorMessage(null);
  }, [participantToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const url = isEditing
        ? `/api/participants/${participantToEdit.id}`
        : "/api/participants";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        lotNumber: formData.lotNumber || `TKD-${Date.now().toString().slice(-4)}`,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || (json.details ? json.details.join(", ") : "Failed to save participant"));
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Participant Details" : "Add New Participant"}
      description={
        isEditing
          ? "Update athlete profile and division metadata."
          : "Register a new athlete into the tournament roster."
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-red-300 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Athlete Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Athlete Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.athleteName}
            onChange={(e) => setFormData({ ...formData, athleteName: e.target.value })}
            placeholder="Full legal name"
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
          />
        </div>

        {/* Academy Name & Athlete ID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Academy / Club Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.academyName}
              onChange={(e) => setFormData({ ...formData, academyName: e.target.value })}
              placeholder="Club or academy name"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Athlete ID (Optional)
            </label>
            <input
              type="text"
              value={formData.athleteId}
              onChange={(e) => setFormData({ ...formData, athleteId: e.target.value })}
              placeholder="TKD-ID"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
          </div>
        </div>

        {/* Gender, Division, Age Group */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Gender <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Division <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.division}
              onChange={(e) => setFormData({ ...formData, division: e.target.value })}
              placeholder="e.g. Senior, Junior, Cadet"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Age Group <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.ageGroup}
              onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
              placeholder="e.g. 18+, 15-17"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
          </div>
        </div>

        {/* Category & Weight Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g. Kyorugi, Poomsae"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Weight Category <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.weightCategory}
              onChange={(e) => setFormData({ ...formData, weightCategory: e.target.value })}
              placeholder="e.g. Under 54 KG, -58 KG"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0052FF]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-slate-600">
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading} className="bg-[#0052FF] hover:bg-[#0045D8]">
            {isEditing ? "Save Changes" : "Create Participant"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

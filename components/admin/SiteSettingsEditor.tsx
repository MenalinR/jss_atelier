"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateSiteSettings } from "@/app/actions/admin";
import { SiteSettings } from "@/sanity/lib/siteSettings";
import { EditButton, Field, FormActions, inputClassName } from "./AdminFields";

const SiteSettingsEditor = ({ settings, className }: { settings: SiteSettings; className?: string }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(undefined);
    startTransition(async () => {
      const result = await updateSiteSettings(formData);
      if (!result.ok) return setError(result.error);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <EditButton label="Edit site text" className={className} onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit website text</DialogTitle>
            <DialogDescription>Home banner, footer and contact details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Field label="Banner title">
              <input name="bannerTitle" defaultValue={settings.bannerTitle} className={inputClassName} />
            </Field>
            <Field label="Banner description">
              <textarea name="bannerDescription" rows={3} defaultValue={settings.bannerDescription} className={inputClassName} />
            </Field>
            <Field label="Footer about text">
              <textarea name="footerAbout" rows={3} defaultValue={settings.footerAbout} className={inputClassName} />
            </Field>
            <Field label="Address">
              <input name="address" defaultValue={settings.address} className={inputClassName} />
            </Field>
            <Field label="Phone">
              <input name="phone" defaultValue={settings.phone} className={inputClassName} />
            </Field>
            <Field label="Business hours">
              <input name="businessHours" defaultValue={settings.businessHours} className={inputClassName} />
            </Field>
            <Field label="Email">
              <input name="email" type="email" defaultValue={settings.email} className={inputClassName} />
            </Field>
            <FormActions pending={pending} error={error} />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SiteSettingsEditor;

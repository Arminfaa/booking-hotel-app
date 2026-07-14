const FIELD_LABELS = {
  title: "Title",
  description: "Description",
  city: "City",
  country: "Country",
  address: "Address",
  latitude: "Latitude",
  longitude: "Longitude",
  images: "Images",
  pricePerNight: "Price per night",
  cleaningFee: "Cleaning fee",
  maxGuests: "Max guests",
  bedrooms: "Bedrooms",
  beds: "Beds",
  bathrooms: "Bathrooms",
  propertyType: "Property type",
  cancellationPolicy: "Cancellation policy",
  amenities: "Amenities",
  "location.coordinates": "Location",
};

/** Map API / Mongoose field paths to form field names. */
const API_FIELD_MAP = {
  "location.coordinates": "latitude",
};

export function getFieldLabel(field) {
  return FIELD_LABELS[field] || field;
}

export function mapApiFieldToForm(field) {
  return API_FIELD_MAP[field] || field;
}

export function applyApiErrorsToForm(form, err) {
  const apiErrors = err?.errors || [];
  if (!apiErrors.length) return false;

  const formErrors = apiErrors.map(({ field, message }) => ({
    name: mapApiFieldToForm(field),
    errors: [message],
  }));

  form.setFields(formErrors);

  const firstField = formErrors[0]?.name;
  if (firstField) {
    form.scrollToField(firstField, { behavior: "smooth", block: "center" });
  }

  return true;
}

export function summarizeApiErrors(err) {
  const apiErrors = err?.errors || [];
  if (!apiErrors.length) return err?.message || "Something went wrong";

  if (apiErrors.length === 1) {
    const { field, message } = apiErrors[0];
    return `${getFieldLabel(field)}: ${message}`;
  }

  return apiErrors
    .map(({ field, message }) => `${getFieldLabel(field)}: ${message}`)
    .join(" · ");
}

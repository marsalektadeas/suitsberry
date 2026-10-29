export const ENQUIRY_EVENT = "suitsberry:enquiry";

export type EnquiryDetail = {
  productName: string;
  productColor?: string;
};

export function requestEnquiry(detail: EnquiryDetail) {
  window.dispatchEvent(
    new CustomEvent<EnquiryDetail>(ENQUIRY_EVENT, { detail })
  );
}

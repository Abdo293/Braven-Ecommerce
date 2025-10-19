import { ContactUs } from "@/components/contact/ContactUs";
import { PagesHeader } from "@/components/PagesHeader";

function Contact() {
  return (
    <div>
      <div className="bg-[#f0f0f0]">
        <div className="container mx-auto max-md:px-3">
          <PagesHeader routes="contact" title="Contact" />
        </div>
      </div>

      <ContactUs />
    </div>
  );
}

export default Contact;

import { useState } from "react";
import { submitContactForm } from "../lib/api";

const initialForm = { name: "", email: "", subject: "", message: "", website: "" };

function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("submitting");
    setFeedback("");
    try {
      const result = await submitContactForm(form);
      setStatus("success");
      setFeedback(result.message || "Message received. I’ll be in touch soon.");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setFeedback(error.message);
    }
  }

  const inputClass = "w-full rounded-lg border border-line bg-surface px-4 py-3 text-paper placeholder:text-muted/60 focus:border-mint focus:outline-none";

  return (
    <section id="contact" className="page-width section-space">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">04 / Your next idea starts here</p>
        <h2 className="section-heading mt-5">Contact me<span className="text-mint">.</span></h2>
        <p className="mt-4 max-w-xl leading-7 text-muted">Have an opportunity, project, or question? Send me a message and I’ll get back to you.</p>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-medium">Name</label>
            <input id="contact-name" name="name" type="text" autoComplete="name" value={form.name} onChange={handleChange} required maxLength={80} className={inputClass} />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-medium">Email</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required maxLength={254} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="contact-subject" className="mb-2 block text-sm font-medium">Subject</label>
            <input id="contact-subject" name="subject" type="text" value={form.subject} onChange={handleChange} required maxLength={120} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="contact-message" className="mb-2 block text-sm font-medium">Message</label>
            <textarea id="contact-message" name="message" value={form.message} onChange={handleChange} required minLength={10} maxLength={5000} rows={7} className={`${inputClass} resize-y`} />
          </div>
          <div aria-hidden="true" className="absolute left-[-9999px]">
            <label htmlFor="contact-website">Website</label>
            <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={handleChange} />
          </div>
          <button type="submit" disabled={status === "submitting"} className="primary-button justify-self-start disabled:cursor-wait disabled:opacity-60">
            {status === "submitting" ? "Sending…" : "Send message →"}
          </button>
          {feedback && <p role="status" aria-live="polite" className={`self-center text-sm ${status === "error" ? "text-rose-300" : "text-mint"}`}>{feedback}</p>}
        </form>
      </div>
    </section>
  );
}

export default ContactForm;

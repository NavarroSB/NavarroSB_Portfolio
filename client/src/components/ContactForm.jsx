import { useState } from "react";
import { submitContactForm } from "../lib/api";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [feedback, setFeedback] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setStatus("submitting");
      setFeedback("");

      const result = await submitContactForm(form);

      setStatus("success");
      setFeedback(result.message);
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setFeedback(error.message);
    }
  }

  return (
    <section
      id="contact"
      className="mx-auto max-w-3xl px-6 py-24"
    >
      <h2 className="text-3xl font-bold">
        Contact Me
      </h2>

      <p className="mt-3 text-slate-400">
        Have an opportunity, project, or question? Send me a message.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-2 block font-medium"
          >
            Name
          </label>

          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={80}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-medium"
          >
            Email
          </label>

          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            maxLength={254}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="subject"
            className="mb-2 block font-medium"
          >
            Subject
          </label>

          <input
            id="subject"
            name="subject"
            type="text"
            value={form.subject}
            onChange={handleChange}
            required
            maxLength={120}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block font-medium"
          >
            Message
          </label>

          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            minLength={10}
            maxLength={5000}
            rows={7}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
          />
        </div>

        {/* Honeypot field. Hide visually, but leave it in the request. */}
        <div
          aria-hidden="true"
          className="absolute left-[-9999px]"
        >
          <label htmlFor="website">
            Website
          </label>

          <input
            id="website"
            name="website"
            type="text"
            tabIndex="-1"
            autoComplete="off"
            value={form.website}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg bg-slate-100 px-6 py-3 font-semibold text-slate-950 disabled:opacity-60"
        >
          {status === "submitting"
            ? "Sending..."
            : "Send Message"}
        </button>

        {feedback && (
          <p
            role="status"
            className="text-sm text-slate-300"
          >
            {feedback}
          </p>
        )}
      </form>
    </section>
  );
}

export default ContactForm;
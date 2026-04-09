"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
  interest: string;
};

type Status = "idle" | "loading" | "success" | "error";

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    message: "",
    interest: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Nastala chyba. Zkuste to prosím znovu.");
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", phone: "", message: "", interest: "" });
    } catch {
      setErrorMsg("Připojení selhalo. Zkuste to prosím znovu.");
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-transparent border-b border-white/12 py-3 text-[#F0EDE8] placeholder-[#444] text-base focus:outline-none focus:border-[#C8A028] transition-colors duration-200";

  return (
    <section id="kontakt" className="py-24 md:py-36 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24">
          {/* Left — info */}
          <div>
            <p className="text-[#C8A028] text-sm tracking-[0.3em] uppercase mb-4">
              Kontakt
            </p>
            <h2
              className="text-[2.8rem] md:text-[3.8rem] leading-[1.1] font-light text-white mb-8"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Napište nám.
              <br />
              <em className="not-italic text-[#C8A028]">
                Ozveme se do 24 h.
              </em>
            </h2>

            <p className="text-[#888580] leading-relaxed mb-10 text-base max-w-sm">
              Každá konzultace je zdarma a nezávazná. Rádi vám pomůžeme najít
              správný oblek — na každou příležitost, pro každý charakter.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-px bg-[#C8A028]" />
                <p className="text-[#F0EDE8] text-base">+420 731 152 421</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-px bg-[#C8A028]" />
                <p className="text-[#F0EDE8] text-base">www.suitsberry.cz</p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            {status === "success" ? (
              <div className="flex flex-col items-start justify-center h-full py-16">
                <div className="w-10 h-px bg-[#C8A028] mb-6" />
                <h3
                  className="text-3xl font-light text-white mb-4"
                  style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
                >
                  Zpráva odeslána.
                </h3>
                <p className="text-[#888580] text-base mb-8">
                  Ozveme se vám do 24 hodin. Těšíme se na spolupráci.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-sm tracking-[0.2em] uppercase text-[#888580] border-b border-white/10 pb-1 hover:text-white hover:border-white/30 transition-colors duration-200"
                >
                  Odeslat další zprávu
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm tracking-[0.2em] uppercase text-[#888580] mb-2">
                      Jméno *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jan Novák"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm tracking-[0.2em] uppercase text-[#888580] mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="jan@example.cz"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm tracking-[0.2em] uppercase text-[#888580] mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+420 777 000 000"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm tracking-[0.2em] uppercase text-[#888580] mb-2">
                      Typ zájmu
                    </label>
                    <select
                      name="interest"
                      value={form.interest}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="" className="bg-[#141414]">Vyberte...</option>
                      <option value="business" className="bg-[#141414]">Business / pracovní</option>
                      <option value="wedding" className="bg-[#141414]">Svatba / slavnostní</option>
                      <option value="event" className="bg-[#141414]">Společenská akce</option>
                      <option value="casual" className="bg-[#141414]">Neformální elegance</option>
                      <option value="other" className="bg-[#141414]">Jiné</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm tracking-[0.2em] uppercase text-[#888580] mb-2">
                    Zpráva *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Popište, co hledáte. Příležitost, styl, preference..."
                    required
                    rows={4}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="gdpr"
                    required
                    className="mt-1 accent-[#C8A028]"
                  />
                  <label htmlFor="gdpr" className="text-sm text-[#888580] leading-relaxed">
                    Souhlasím se{" "}
                    <a href="#" className="underline hover:text-[#F0EDE8] transition-colors">
                      zpracováním osobních údajů
                    </a>{" "}
                    za účelem odpovědi na mou poptávku.
                  </label>
                </div>

                {status === "error" && (
                  <p className="text-base text-red-400">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center px-8 py-4 bg-[#C8A028] text-[#0A0A0A] text-sm tracking-[0.2em] uppercase font-medium hover:bg-[#D4AF40] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {status === "loading" ? "Odesílám..." : "Odeslat poptávku"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import test from "node:test";
import assert from "node:assert/strict";
import { renderTemplate } from "../lib/reminders";

test("remplace uniquement les variables autorisées", () => {
  const result = renderTemplate("Bonjour {{prenom}}, {{vehicule}} · {{date}} · {{garage}} · {{secret}}", {
    firstName: "Nadia", vehicle: "Peugeot 208", date: "10 mars 2027", garage: "Garage Atlas",
  });
  assert.equal(result, "Bonjour Nadia, Peugeot 208 · 10 mars 2027 · Garage Atlas · {{secret}}");
});

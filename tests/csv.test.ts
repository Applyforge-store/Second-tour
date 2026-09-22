import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv } from "../lib/csv";

test("lit un CSV séparé par des virgules", () => {
  const rows = parseCsv('prenom,email,vehicule\nNadia,nadia@example.com,"Peugeot, 208"');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].vehicule, "Peugeot, 208");
});

test("lit un CSV européen séparé par des points-virgules", () => {
  const rows = parseCsv("prenom;email;vehicule\nAmine;amine@example.com;Dacia");
  assert.equal(rows[0].email, "amine@example.com");
});

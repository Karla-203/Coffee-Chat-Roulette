"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className="px-4 py-2 bg-blue-600 text-white rounded mt-2"
    {...props}
  />
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className="p-2 border rounded w-full mb-2" {...props} />
);
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className="p-2 border rounded w-full mb-2" {...props} />
);

interface Match {
  "Person 1": string;
  "Person 2": string;
}

export default function CoffeeChatRoulette() {
  const [file, setFile] = useState<File | null>(null);
  const [fixedMatches, setFixedMatches] = useState<string>("");
  const [output, setOutput] = useState<Match[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

 const handleGenerate = async () => {
  if (!file) return;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

  // Process fixed matches
  const fixedPairs: [string, string][] = fixedMatches
    .split("\n")
    .map(line => line.split(",").map(name => name.trim()))
    .filter((pair): pair is [string, string] => pair.length === 2);

  // Create a Set of all individuals involved in fixed matches (case-insensitive)
  const fixedIndividuals = new Set<string>();
  fixedPairs.forEach(([a, b]) => {
    fixedIndividuals.add(a.toLowerCase());
    fixedIndividuals.add(b.toLowerCase());
  });

  // Build past matches map (normalize names to lowercase and trim whitespace)
  const pastMatchesMap: Record<string, string[]> = {};
  json.forEach((person: Record<string, any>) => {
    const staffName = person["Staff Name"]?.trim();
    if (staffName) {
      const matches: string[] = [];
      for (let i = 1; i <= 5; i++) {
        const match = person[`Previous match #${i}`]?.trim();
        if (match) matches.push(match.toLowerCase());
      }
      pastMatchesMap[staffName.toLowerCase()] = matches;
    }
  });

  // Filter out fixed individuals from the initial list for random matching
  const remaining = json.filter((p: Record<string, any>) =>
    !fixedIndividuals.has(p["Staff Name"]?.trim()?.toLowerCase())
  );

  const shuffled = [...remaining].sort(() => 0.5 - Math.random());

  const matches: Match[] = [];
  const used = new Set<string>(); // Keep track of randomly matched individuals
  const unmatched: string[] = [];

  for (let i = 0; i < shuffled.length; i++) {
    const person1 = shuffled[i];
    const name1 = person1["Staff Name"]?.trim();
    if (!name1 || used.has(name1)) continue;

    let found = false;
    for (let j = i + 1; j < shuffled.length; j++) {
      const person2 = shuffled[j];
      const name2 = person2["Staff Name"]?.trim();
      if (!name2 || used.has(name2)) continue;

      const notSameTeam = person1["Team #"] !== person2["Team #"];
      const notSameSite = person1["Site"] !== person2["Site"];
      const notPastMatch =
        !pastMatchesMap[name1.toLowerCase()]?.includes(name2.toLowerCase()) &&
        !pastMatchesMap[name2.toLowerCase()]?.includes(name1.toLowerCase());

      if (notSameTeam && notSameSite && notPastMatch) {
        matches.push({ "Person 1": name1, "Person 2": name2 });
        used.add(name1);
        used.add(name2);
        found = true;
        break;
      }
    }

    if (!found && !used.has(name1)) { // Ensure unmatched person wasn't already fixed
      unmatched.push(name1);
    }
  }

  // Combine fixed matches with the randomly generated matches and unmatched
  const allMatches: Match[] = [
    ...fixedPairs.map(([a, b]) => ({ "Person 1": a.trim(), "Person 2": b.trim() })),
    ...matches,
    ...unmatched.map(name => ({ "Person 1": name, "Person 2": "" })),
  ];

  setOutput(allMatches);
};


  const downloadMatches = () => {
    const worksheet = XLSX.utils.json_to_sheet(output);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Matches");
    XLSX.writeFile(workbook as XLSX.WorkBook, "New_Coffee_Matches.xlsx");
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 font-calibri">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
          <span>☕</span> Coffee Chat Roulette
        </h1>

        {/* Upload Excel File */}
        <div className="mb-6">
          <p className="font-bold text-lg mb-2">Upload Excel File</p>
          <Input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
        </div>

        {/* Enter Fixed Matches */}
        <div className="mb-6">
          <p className="font-bold text-lg mb-1">Enter Fixed Matches</p>
          <p className="text-sm text-gray-600 mb-2">
            Format: <strong>comma-separated</strong> for each pair.
            <br />
            <span className="italic">
              Make sure to press <kbd>Enter</kbd> after each pair to finalize
              it.
            </span>
          </p>
          <Textarea
            rows={5}
            value={fixedMatches}
            onChange={(e) => setFixedMatches(e.target.value)}
            placeholder={`John Smith, Jane Doe\nAga Karczewska, Tom Carroll`}
          />
        </div>

        {/* Generate Matches */}
        <div className="mb-6">
          <p className="font-bold text-lg mb-2">Generate Matches</p>
          <Button onClick={handleGenerate} className="w-full">
            Generate
          </Button>
        </div>

        {/* Output */}
        {output.length > 0 && (
          <div className="pt-4 space-y-2">
            <Button onClick={downloadMatches}>Download Matches (Excel)</Button>
            <div className="max-h-64 overflow-y-auto border rounded bg-gray-50 p-4 text-sm space-y-1">
              {output.map((match, i) => (
                <div key={i}>
                  {match["Person 1"]}{" "}
                  {match["Person 2"] && <>↔ {match["Person 2"]}</>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import { normalize, schema } from "normalizr";
import { Readable } from "stream";
import * as fs from "fs";
import { sourceEntryWithTheads } from "./types";

function saveFile(text: any, filename: string): void {
  const readable = Readable.from(JSON.stringify(text, null, 2));
  const writeStream = fs.createWriteStream(`./data/${filename}.json`);
  readable.pipe(writeStream);
}

const thead = new schema.Entity(
  "theads",
  {},
  {
    idAttribute: Entity => Entity.title.slice(0, 25),
    processStrategy: (entiry, parent) => ({ ...entiry, atNode: parent.title })
  }
);

const node = new schema.Entity(
  "nodes",
  { theads: [thead] },
  {
    idAttribute: Entity => Entity.title.slice(0, 25),
    processStrategy: (entiry, parent) => ({ ...entiry, atNode: parent.title })
  }
);
const zone = new schema.Entity("zone", {
  sourceNodes: [node]
}, {idAttribute: "topic"});

export function main(): void {
  const completedZone = JSON.parse(
    fs.readFileSync("./data/mainZone.json").toString()
  ) as sourceEntryWithTheads[0];

  const normalizedData = normalize(completedZone, zone);
  saveFile(normalizedData, "mainZoneTheads");
}

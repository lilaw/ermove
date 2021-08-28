const { Readable } = require("stream");
const fs = require("fs");
const { normalize, schema } = require("normalizr");

const theadsEntry = JSON.parse(
  fs.readFileSync("./src/completedZone.json").toString()
);

const theadSchema = new schema.Entity(
  "thead",
  {},
  {
    idAttribute: value => value.title.slice(0, 25),
    processStrategy: (entity, parent) => ({ ...entity, atNode: parent.title})
  }
);
const theads = new schema.Array(theadSchema);

const nodeSchema = new schema.Entity(
  "nodes",
  { theads: theads },
  { idAttribute: "title", processStrategy: (entity, parent) => ({...entity, atZone: parent.topic}) }
);
const nodes = new schema.Array(nodeSchema);

const zoneSchema = new schema.Entity(
  "zones",
  { sourceNodes: nodes },
  { idAttribute: "topic" }
);
const zones = new schema.Array(zoneSchema);
const normalizedData = normalize(theadsEntry, zoneSchema);
saveFile(normalizedData, "completedZoneTheads");

function saveFile(text, filename) {
  const readable = Readable.from(JSON.stringify(text, null, 2));
  const writeStream = fs.createWriteStream(`./${filename}.json`);
  readable.pipe(writeStream);
}

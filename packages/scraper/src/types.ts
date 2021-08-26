export type thead = {
  title: string | undefined;
  url: string | undefined;
  author: string | undefined;
  status: string | undefined;
};
export interface sourceNode {
  title: string;
  url: string;
}
export interface sourceNodeWithTheads extends sourceNode {
  theads: thead[];
}
export type sourceEntry = {
  topic: string;
  sourceNodes: sourceNode[];
}[];
export type sourceEntryWithTheads = {
  topic: string;
  sourceNodes: sourceNodeWithTheads[];
}[]
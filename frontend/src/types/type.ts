export type DictionaryItem = {
    id: string;
    word: string;
    definition: string;
    instruction: string;
    source: string;
    category: string;
}

export interface PoseViewerElement extends HTMLElement {
  play?: () => void;
  pause?: () => void;
  stop?: () => void;
}

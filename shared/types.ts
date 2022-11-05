export type Path = string;
export interface Project {
  // thumbnail: Image[]
  imgs: { src: string; w: number; h: number }[];
  root: Path;
}

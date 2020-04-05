export interface EncodeResultDTO {
  id: number;
  duration: number;
  width: number;
  height: number;
  bitrate: number;
  size: number;
  date: string;
}

export interface EncodeDTO {
  id: number;
  inpath: string;
  outpath: string;
  options: string;
  progress: number;
  before: EncodeResultDTO | null;
  after: EncodeResultDTO | null;
  date: string;
}

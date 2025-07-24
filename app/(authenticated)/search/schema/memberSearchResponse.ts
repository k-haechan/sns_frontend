export interface MemberSearchResponse {
  message: string;
  data: {
    member_id: number;
    username: string;
    real_name: string;
    profile_image_url: string | null;
  };
} 
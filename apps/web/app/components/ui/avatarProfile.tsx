import { useImageUrl } from '@/app/hooks/useMinioImage';
import { Avatar } from '@mui/material';

interface AvatarProfileProps {
  name: string;
  imageKey: string | null | undefined;
}
export function AvatarProfile({ name, imageKey }: AvatarProfileProps) {
  const { url: url } = useImageUrl(imageKey);
  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  return (
    <Avatar
      src={url ?? undefined}
      alt={'user.name'}
      sx={{
        width: 34,
        height: 34,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {getInitials(name)}
    </Avatar>
  );
}

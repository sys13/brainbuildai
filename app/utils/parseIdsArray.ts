export default function (input: (string | undefined)[]): string[] {
	return input.flatMap((item) => item?.split(',')).filter(Boolean)
}

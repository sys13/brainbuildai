import { type ComboFilterProps, ComboSpecial } from './combo-special'

type SearchParamsFilterProps = ComboFilterProps & { name: string }
export function SpecialSearchParamsFilter({
	...props
}: SearchParamsFilterProps) {
	return <ComboSpecial {...props} doQueryParams />
}

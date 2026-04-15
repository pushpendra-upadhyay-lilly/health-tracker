import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

/** Light tap — water presets, quick-add buttons */
export async function hapticLight() {
  await Haptics.impact({ style: ImpactStyle.Light }).catch(() => {})
}

/** Medium tap — set completion */
export async function hapticMedium() {
  await Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {})
}

/** Success pulse — workout complete, plan saved */
export async function hapticSuccess() {
  await Haptics.notification({ type: NotificationType.Success }).catch(() => {})
}

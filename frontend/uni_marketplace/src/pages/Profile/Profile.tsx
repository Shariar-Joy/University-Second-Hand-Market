import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Building2,
  Camera,
  Hash,
  LogOut,
  Mail,
  Package,
  Pencil,
  Phone,
  ShoppingBag,
  Tag,
  Trash2,
  UserRound,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { ProductCardSkeleton, ProfileSkeleton } from '../../components/ui/LoadingSkeleton'
import ProductCard from '../../components/product/ProductCard'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { ApiError } from '../../services/apiClient'
import * as authService from '../../services/authService'
import * as productService from '../../services/productService'
import type { Product } from '../../services/productService'
import { universities } from '../../data/universities'
import { ROUTES } from '../../routes/routePaths'

const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

type TabKey = 'mine' | 'sold' | 'purchased'

const TABS: { key: TabKey; label: string; icon: typeof Package }[] = [
  { key: 'mine', label: 'My Listings', icon: Package },
  { key: 'sold', label: 'Sold', icon: Tag },
  { key: 'purchased', label: 'Purchased', icon: ShoppingBag },
]

const TAB_FETCHERS: Record<TabKey, () => Promise<Product[]>> = {
  mine: productService.listMine,
  sold: productService.listSold,
  purchased: productService.listPurchased,
}

const TAB_EMPTY_COPY: Record<TabKey, { title: string; description: string }> = {
  mine: { title: "You haven't listed anything yet", description: 'Items you list for sale will show up here.' },
  sold: { title: 'Nothing sold yet', description: 'Mark one of your listings as sold to see it here.' },
  purchased: { title: "You haven't bought anything yet", description: 'Items you purchase from other students will show up here.' },
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

function Profile() {
  const { user, isCheckingSession, logout, setUser } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [editValues, setEditValues] = useState({ fullName: '', phone: '', department: '', university: '', bio: '' })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  const [activeTab, setActiveTab] = useState<TabKey>('mine')
  const [listingsByTab, setListingsByTab] = useState<Record<TabKey, Product[] | null>>({
    mine: null,
    sold: null,
    purchased: null,
  })
  const [loadingTab, setLoadingTab] = useState<TabKey | null>(null)

  const [soldModalProduct, setSoldModalProduct] = useState<Product | null>(null)
  const [buyerIdentifier, setBuyerIdentifier] = useState('')
  const [isMarkingSold, setIsMarkingSold] = useState(false)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  async function fetchTab(tab: TabKey) {
    setLoadingTab(tab)
    try {
      const products = await TAB_FETCHERS[tab]()
      setListingsByTab((previous) => ({ ...previous, [tab]: products }))
    } catch (error) {
      showToast(errorMessage(error, 'Could not load listings. Please try again.'), 'error')
    } finally {
      setLoadingTab(null)
    }
  }

  useEffect(() => {
    if (!user) return
    if (listingsByTab[activeTab] === null) {
      fetchTab(activeTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      navigate(ROUTES.HOME)
    }
  }

  function handleAvatarButtonClick() {
    fileInputRef.current?.click()
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      showToast('Please choose a JPEG, PNG, WEBP, or GIF image.', 'error')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      showToast('Image must be 5MB or smaller.', 'error')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const updated = await authService.uploadAvatar(file)
      setUser(updated)
      showToast('Profile photo updated.', 'success')
    } catch (error) {
      showToast(errorMessage(error, 'Could not upload photo. Please try again.'), 'error')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  function openEditModal() {
    if (!user) return
    setEditValues({
      fullName: user.fullName,
      phone: user.phone ?? '',
      department: user.department,
      university: user.university,
      bio: user.bio ?? '',
    })
    setEditErrors({})
    setIsEditOpen(true)
  }

  function updateEditField(field: keyof typeof editValues, value: string) {
    setEditValues((previous) => ({ ...previous, [field]: value }))
  }

  async function handleEditSubmit(event: FormEvent) {
    event.preventDefault()

    const errors: Record<string, string> = {}
    if (editValues.fullName.trim().length < 2) errors.fullName = 'Enter your full name.'
    if (!editValues.department.trim()) errors.department = 'Enter your department.'
    if (!editValues.university.trim()) errors.university = 'Select your university.'
    if (editValues.bio.length > 500) errors.bio = 'Bio must be 500 characters or fewer.'

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }

    setIsSavingProfile(true)
    try {
      const updated = await authService.updateProfile({
        fullName: editValues.fullName.trim(),
        phone: editValues.phone.trim(),
        department: editValues.department.trim(),
        university: editValues.university,
        bio: editValues.bio.trim(),
      })
      setUser(updated)
      setIsEditOpen(false)
      showToast('Profile updated.', 'success')
    } catch (error) {
      showToast(errorMessage(error, 'Could not update profile. Please try again.'), 'error')
    } finally {
      setIsSavingProfile(false)
    }
  }

  function openSoldModal(product: Product) {
    setSoldModalProduct(product)
    setBuyerIdentifier('')
  }

  async function handleConfirmSold(event: FormEvent) {
    event.preventDefault()
    if (!soldModalProduct) return

    setIsMarkingSold(true)
    try {
      await productService.markAsSold(soldModalProduct.id, buyerIdentifier.trim() || undefined)
      setListingsByTab((previous) => ({ ...previous, mine: null, sold: null }))
      setSoldModalProduct(null)
      showToast('Listing marked as sold.', 'success')
      await fetchTab(activeTab === 'sold' ? 'sold' : 'mine')
    } catch (error) {
      showToast(errorMessage(error, 'Could not mark this listing as sold.'), 'error')
    } finally {
      setIsMarkingSold(false)
    }
  }

  async function handleDeleteAccount(event: FormEvent) {
    event.preventDefault()
    setDeleteError('')
    setIsDeleting(true)
    try {
      await authService.deleteAccount(deletePassword)
      setUser(null)
      setIsDeleteOpen(false)
      navigate(ROUTES.HOME)
      showToast('Account deleted.', 'success')
    } catch (error) {
      setDeleteError(errorMessage(error, 'Could not delete account. Please try again.'))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isCheckingSession) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
        <ProfileSkeleton />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold text-ink">You're not signed in</h1>
        <p className="text-sm text-ink-soft">Log in to view your profile.</p>
        <div className="mt-2 flex gap-3">
          <Button to={ROUTES.LOGIN} variant="outline" size="lg">
            Log In
          </Button>
          <Button to={ROUTES.REGISTER} size="lg">
            Create Account
          </Button>
        </div>
      </div>
    )
  }

  const details = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Building2, label: 'University', value: user.university },
    { icon: UserRound, label: 'Department', value: user.department },
    { icon: Hash, label: 'Student ID', value: user.studentId },
    ...(user.phone ? [{ icon: Phone, label: 'Phone', value: user.phone }] : []),
  ]

  const activeProducts = listingsByTab[activeTab]
  const isActiveTabLoading = loadingTab === activeTab

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl border border-border bg-white p-8 shadow-card"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative">
            <Avatar name={user.fullName} src={user.profileImage} size="lg" />
            <button
              type="button"
              onClick={handleAvatarButtonClick}
              disabled={isUploadingAvatar}
              className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-card transition-colors hover:bg-primary-hover disabled:opacity-60"
              aria-label="Change profile photo"
            >
              <Camera className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">{user.fullName}</h1>
            <p className="text-sm text-ink-soft">@{user.username}</p>
          </div>
          {user.bio && <p className="max-w-md text-sm text-ink-soft">{user.bio}</p>}
        </div>

        <dl className="mt-8 flex flex-col divide-y divide-border rounded-2xl border border-border">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-ink-soft">{label}</dt>
                <dd className="truncate text-sm font-medium text-ink">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="lg" fullWidth onClick={openEditModal}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit Profile
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={handleLogout}
            loading={isLoggingOut}
          >
            {!isLoggingOut && <LogOut className="h-4 w-4" aria-hidden="true" />}
            {isLoggingOut ? 'Logging out…' : 'Log Out'}
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-card sm:p-8"
      >
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={[
                'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab.key ? 'bg-primary/10 text-primary' : 'text-ink-soft hover:bg-slate-100 hover:text-ink',
              ].join(' ')}
            >
              <tab.icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {isActiveTabLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          )}

          {!isActiveTabLoading && activeProducts && activeProducts.length === 0 && (
            <EmptyState icon={TABS.find((tab) => tab.key === activeTab)!.icon} {...TAB_EMPTY_COPY[activeTab]} />
          )}

          {!isActiveTabLoading && activeProducts && activeProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {activeProducts.map((product) => (
                <div key={product.id} className="flex flex-col gap-2">
                  <ProductCard product={product} />
                  {activeTab === 'mine' && product.status === 'available' && (
                    <Button variant="outline" size="sm" onClick={() => openSoldModal(product)}>
                      <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                      Mark as Sold
                    </Button>
                  )}
                  {product.status === 'sold' && (
                    <p className="text-center text-xs text-ink-soft">
                      Sold{product.buyerName ? ` to ${product.buyerName}` : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-8 rounded-3xl border border-danger/20 bg-danger/5 p-6 shadow-card sm:p-8"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2 className="text-base font-semibold text-ink">Danger Zone</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Deleting your account is permanent and cannot be undone. Your past listings will remain visible but
              will no longer be linked to your profile.
            </p>
            <Button
              variant="danger"
              size="md"
              className="mt-4"
              onClick={() => {
                setDeletePassword('')
                setDeleteError('')
                setIsDeleteOpen(true)
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete Account
            </Button>
          </div>
        </div>
      </motion.div>

      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Profile" size="md">
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            value={editValues.fullName}
            onChange={(event) => updateEditField('fullName', event.target.value)}
            error={editErrors.fullName}
            required
          />
          <Input
            label="Phone"
            value={editValues.phone}
            onChange={(event) => updateEditField('phone', event.target.value)}
            placeholder="01700000000"
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-university" className="text-sm font-medium text-ink">
              University <span className="text-danger">*</span>
            </label>
            <select
              id="edit-university"
              value={editValues.university}
              onChange={(event) => updateEditField('university', event.target.value)}
              required
              className={[
                'h-11 w-full appearance-none rounded-lg border bg-white px-3.5 text-sm text-ink outline-none transition-colors',
                'focus:border-primary focus:ring-4 focus:ring-primary/10',
                editErrors.university ? 'border-danger' : 'border-border',
              ].join(' ')}
            >
              <option value="" disabled>
                Select your university
              </option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.name}>
                  {uni.name}
                </option>
              ))}
            </select>
            {editErrors.university && (
              <p className="text-sm text-danger" role="alert">
                {editErrors.university}
              </p>
            )}
          </div>
          <Input
            label="Department"
            value={editValues.department}
            onChange={(event) => updateEditField('department', event.target.value)}
            error={editErrors.department}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-bio" className="text-sm font-medium text-ink">
              Bio
            </label>
            <textarea
              id="edit-bio"
              rows={4}
              maxLength={500}
              placeholder="Tell other students a bit about yourself…"
              value={editValues.bio}
              onChange={(event) => updateEditField('bio', event.target.value)}
              className="w-full resize-none rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
            {editErrors.bio && (
              <p className="text-sm text-danger" role="alert">
                {editErrors.bio}
              </p>
            )}
          </div>
          <Button type="submit" size="lg" fullWidth loading={isSavingProfile} className="mt-2">
            Save Changes
          </Button>
        </form>
      </Modal>

      <Modal isOpen={soldModalProduct !== null} onClose={() => setSoldModalProduct(null)} title="Mark as Sold" size="sm">
        <form onSubmit={handleConfirmSold} className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">
            Mark <span className="font-semibold text-ink">{soldModalProduct?.name}</span> as sold. Optionally record
            who bought it.
          </p>
          <Input
            label="Buyer username or email (optional)"
            value={buyerIdentifier}
            onChange={(event) => setBuyerIdentifier(event.target.value)}
            placeholder="e.g. nusrat.jahan"
          />
          <Button type="submit" size="lg" fullWidth loading={isMarkingSold}>
            Confirm Sold
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Account" size="sm">
        <form onSubmit={handleDeleteAccount} className="flex flex-col gap-4">
          <p className="text-sm text-ink-soft">
            This will permanently delete your account. Enter your password to confirm.
          </p>
          <Input
            label="Password"
            type="password"
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            error={deleteError}
            required
          />
          <Button type="submit" variant="danger" size="lg" fullWidth loading={isDeleting}>
            Permanently Delete Account
          </Button>
        </form>
      </Modal>
    </div>
  )
}

export default Profile

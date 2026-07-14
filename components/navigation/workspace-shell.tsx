"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowUpDown, Home, MessageSquare, PanelLeftClose, PanelLeftOpen, RotateCcw, School, Settings2, Users } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { resolveCourseIdentity } from "@/lib/course-identity"
import {
  contextFromPath, contextLabel, defaultCourseHref, groupsForContext, isSectionActive,
  type BrowseContext,
} from "@/lib/navigation-config"
import type { NavigationCourse, WorkspaceUser } from "@/types/navigation"
import { rememberCourseSection, reorderCourses, updateWorkspacePreference } from "@/lib/actions/workspace-preferences.actions"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UserSettings } from "@/components/user-settings"
import { useMobileHeader } from "@/components/mobile-header-context"

function CourseMark({ course, className }: { course: NavigationCourse; className?: string }) {
  const identity = resolveCourseIdentity(course)
  const [failed, setFailed] = React.useState(false)
  return (
    <span aria-hidden className={cn(
      "course-code-mark relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-extrabold transition-[border-radius,transform] group-hover:rounded-lg",
      identity.background, identity.foreground,
      identity.imageUrl && !failed && `ring-2 ${identity.ring}`,
      className,
    )}>
      {identity.imageUrl && !failed
        ? <img src={identity.imageUrl} alt="" className="size-full object-cover" onError={() => setFailed(true)} />
        : identity.label}
    </span>
  )
}

function SortableCourse({ course, active, reorderEnabled, onSelect }: {
  course: NavigationCourse
  active: boolean
  reorderEnabled: boolean
  onSelect?: (context: BrowseContext) => void
}) {
  const sortableId = `${course.roleContext}:${course.id}`
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sortableId, disabled: !reorderEnabled })
  const content = (
    <span className="group relative flex h-12 w-full items-center justify-center">
      <CourseMark course={course} className={cn(active && "rounded-lg ring-2 ring-[var(--workspace-rail-active)]", isDragging && "opacity-60")} />
    </span>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes} {...listeners}>
          {onSelect ? (
            <button type="button" className="w-full" onClick={() => !isDragging && onSelect({ kind: "course", course })} aria-label={resolveCourseIdentity(course).accessibleName}>{content}</button>
          ) : (
            <Link href={defaultCourseHref(course)} aria-label={resolveCourseIdentity(course).accessibleName}>{content}</Link>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">{resolveCourseIdentity(course).accessibleName}</TooltipContent>
    </Tooltip>
  )
}

function RailDestination({ label, href, active, icon: Icon, onSelect }: {
  label: string
  href: string
  active: boolean
  icon: React.ElementType
  onSelect?: () => void
}) {
  const mark = <span className={cn(
    "flex size-10 items-center justify-center rounded-xl transition-all group-hover:rounded-lg",
    active ? "rounded-lg bg-indigo-500 text-white" : "bg-[var(--workspace-rail-icon)] text-[var(--workspace-rail-foreground)] group-hover:bg-indigo-500 group-hover:text-white",
  )}><Icon className="size-[18px]" /></span>
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {onSelect
          ? <button type="button" onClick={onSelect} aria-label={label} className="group flex h-11 w-full items-center justify-center">{mark}</button>
          : <Link href={href} aria-label={label} className="group flex h-11 w-full items-center justify-center">{mark}</Link>}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function CourseRail({ user, courses, activeContext, onSelect, reorderEnabled = true }: {
  user: WorkspaceUser
  courses: NavigationCourse[]
  activeContext: BrowseContext
  onSelect?: (context: BrowseContext) => void
  reorderEnabled?: boolean
}) {
  const [ordered, setOrdered] = React.useState(courses)
  React.useEffect(() => setOrdered(courses), [courses])
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 7 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const teaching = ordered.filter((course) => course.roleContext === "teacher")
  const enrolled = ordered.filter((course) => course.roleContext === "student")

  const handleDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : null
    if (!overId || activeId === overId) return
    const [role] = activeId.split(":") as ["teacher" | "student"]
    if (!overId.startsWith(`${role}:`)) return
    const group = ordered.filter((course) => course.roleContext === role)
    const oldIndex = group.findIndex((course) => `${role}:${course.id}` === activeId)
    const newIndex = group.findIndex((course) => `${role}:${course.id}` === overId)
    const nextGroup = arrayMove(group, oldIndex, newIndex)
    const previous = ordered
    setOrdered(ordered.map((course) => course.roleContext === role ? nextGroup.shift()! : course))
    void reorderCourses(role, group.length ? arrayMove(group, oldIndex, newIndex).map((course) => course.id) : []).then((result) => {
      if (result.error) {
        setOrdered(previous)
        toast.error(result.error)
      }
    })
  }

  const select = (context: BrowseContext) => onSelect?.(context)
  return (
    <TooltipProvider delayDuration={100}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <aside className="flex h-full w-14 shrink-0 flex-col border-r border-[var(--workspace-rail-divider)] bg-[var(--workspace-rail)] text-[var(--workspace-rail-foreground)] md:w-16">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
            <RailDestination label="Home" href="/home" icon={Home} active={activeContext.kind === "home"} onSelect={onSelect ? () => select({ kind: "home" }) : undefined} />
            <RailDestination label="Messages" href="/socials" icon={MessageSquare} active={activeContext.kind === "messages"} onSelect={onSelect ? () => select({ kind: "messages" }) : undefined} />
            <div className="mx-auto my-2 h-px w-8 bg-[var(--workspace-rail-divider)]" />
            {teaching.length > 0 && <>
              <div className="px-1 pb-1 text-center text-[9px] font-semibold uppercase tracking-wider text-slate-500">Teach</div>
              <SortableContext items={teaching.map((course) => `teacher:${course.id}`)} strategy={verticalListSortingStrategy}>
                {teaching.map((course) => <SortableCourse key={`teacher:${course.id}`} course={course} active={activeContext.kind === "course" && activeContext.course.id === course.id && activeContext.course.roleContext === "teacher"} reorderEnabled={reorderEnabled} onSelect={onSelect} />)}
              </SortableContext>
            </>}
            {enrolled.length > 0 && <>
              <div className="mx-auto my-2 h-px w-8 bg-[var(--workspace-rail-divider)]" />
              <div className="px-1 pb-1 text-center text-[9px] font-semibold uppercase tracking-wider text-slate-500">Learn</div>
              <SortableContext items={enrolled.map((course) => `student:${course.id}`)} strategy={verticalListSortingStrategy}>
                {enrolled.map((course) => <SortableCourse key={`student:${course.id}`} course={course} active={activeContext.kind === "course" && activeContext.course.id === course.id && activeContext.course.roleContext === "student"} reorderEnabled={reorderEnabled} onSelect={onSelect} />)}
              </SortableContext>
            </>}
            <div className="mx-auto my-2 h-px w-8 bg-[var(--workspace-rail-divider)]" />
            {user.roles.includes("ADMIN") && <RailDestination label="Administration" href="/admin" icon={Settings2} active={activeContext.kind === "admin"} onSelect={onSelect ? () => select({ kind: "admin" }) : undefined} />}
            {user.roles.includes("HOMEROOM_TEACHER") && <RailDestination label="Homeroom" href="/homeroom" icon={School} active={activeContext.kind === "homeroom"} onSelect={onSelect ? () => select({ kind: "homeroom" }) : undefined} />}
            {user.roles.includes("PARENT") && <RailDestination label="Family" href="/parent" icon={Users} active={activeContext.kind === "family"} onSelect={onSelect ? () => select({ kind: "family" }) : undefined} />}
          </div>
          <div className="flex justify-center border-t border-[var(--workspace-rail-divider)] p-2">
            <UserSettings email={user.email} name={user.name} nickname={user.nickname} image={user.image} side="right" align="end" />
          </div>
        </aside>
      </DndContext>
    </TooltipProvider>
  )
}

function SectionSidebar({ context, roles, pathname, onNavigate, onCollapse }: {
  context: BrowseContext
  roles: WorkspaceUser["roles"]
  pathname: string
  onNavigate?: () => void
  onCollapse?: () => void
}) {
  const groups = groupsForContext(context, roles)
  return (
    <aside className="flex h-full w-full min-w-0 flex-col bg-[var(--workspace-sidebar)] text-foreground">
      <div className="workspace-topbar flex h-14 min-h-14 shrink-0 items-center gap-2 border-b px-4 py-1.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{contextLabel(context)}</div>
          {context.kind === "course" && context.course.class?.name && <div className="truncate text-[11px] text-muted-foreground">{context.course.class.name}</div>}
        </div>
        {onCollapse && <Button variant="ghost" size="icon" className="size-8" onClick={onCollapse} aria-label="Collapse sections"><PanelLeftClose className="size-4" /></Button>}
      </div>
      <nav className="flex-1 space-y-3 overflow-y-auto p-2">
        {groups.map((group) => (
          <div key={group.id}>
            {group.label && <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</div>}
            <div className="space-y-0.5">
              {group.sections.map((section) => {
                const Icon = section.icon
                const active = isSectionActive(pathname, section)
                return <Link key={section.id} href={section.href} onClick={() => {
                  if (context.kind === "course") void rememberCourseSection(context.course.id, context.course.roleContext, section.id)
                  onNavigate?.()
                }} className={cn(
                  "flex min-h-8 items-center gap-2 rounded-md px-2.5 text-sm transition-colors",
                  active ? "bg-indigo-500/12 font-medium text-indigo-700 dark:text-indigo-300" : "text-muted-foreground hover:bg-[var(--workspace-row-hover)] hover:text-foreground",
                )}>
                  <Icon className="size-4" />
                  <span className="truncate">{section.label}</span>
                  {section.actionHref && <span className="ml-auto text-base text-muted-foreground">+</span>}
                </Link>
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export function WorkspaceShell({ children, user, courses, channelSidebarCollapsed = false }: {
  children: React.ReactNode
  user: WorkspaceUser
  courses: NavigationCourse[]
  channelSidebarCollapsed?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const mobileHeader = useMobileHeader()
  const routeContext = contextFromPath(pathname, courses)
  const [collapsed, setCollapsed] = React.useState(channelSidebarCollapsed)
  const [tabletSectionsOpen, setTabletSectionsOpen] = React.useState(false)
  const [mobileNavigatorOpen, setMobileNavigatorOpen] = React.useState(false)
  const [browseContext, setBrowseContext] = React.useState<BrowseContext>(routeContext)
  const [mobileReorder, setMobileReorder] = React.useState(false)
  const isSocials = pathname.startsWith("/socials")

  React.useEffect(() => {
    setBrowseContext(routeContext)
  }, [pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const handlePop = () => {
      if (mobileNavigatorOpen) setMobileNavigatorOpen(false)
    }
    window.addEventListener("popstate", handlePop)
    return () => window.removeEventListener("popstate", handlePop)
  }, [mobileNavigatorOpen])

  const openMobileNavigator = () => {
    setBrowseContext(routeContext)
    window.history.pushState({ ...window.history.state, arsyncNavigator: true }, "")
    setMobileNavigatorOpen(true)
  }
  const closeMobileNavigator = () => {
    if (window.history.state?.arsyncNavigator) window.history.back()
    else setMobileNavigatorOpen(false)
  }
  const navigateFromMobile = (href?: string) => {
    window.history.replaceState({ ...window.history.state, arsyncNavigator: undefined }, "")
    setMobileNavigatorOpen(false)
    if (href) router.push(href)
  }
  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    void updateWorkspacePreference({ density: document.documentElement.dataset.density === "comfortable" ? "comfortable" : "compact", theme: (document.documentElement.dataset.theme as "system" | "light" | "dark") || "system", channelSidebarCollapsed: next })
  }

  const activeGroups = groupsForContext(routeContext, user.roles)
  const activeSection = activeGroups.flatMap((group) => group.sections).find((section) => isSectionActive(pathname, section))
  const pageTitle = mobileHeader.title || activeSection?.label || contextLabel(routeContext)

  return (
    <div className="workspace-shell flex h-dvh min-h-0 w-full overflow-hidden bg-[var(--workspace-canvas)]">
      <div className="hidden md:flex"><CourseRail user={user} courses={courses} activeContext={routeContext} /></div>

      {!collapsed && <div className="hidden w-60 shrink-0 border-r lg:flex"><SectionSidebar context={routeContext} roles={user.roles} pathname={pathname} onCollapse={toggleCollapsed} /></div>}

      {tabletSectionsOpen && <div className="fixed inset-0 z-50 hidden md:flex lg:hidden">
        <button className="absolute inset-0 bg-black/40" onClick={() => setTabletSectionsOpen(false)} aria-label="Close sections" />
        <div className="relative ml-16 w-60 border-r shadow-xl"><SectionSidebar context={routeContext} roles={user.roles} pathname={pathname} onNavigate={() => setTabletSectionsOpen(false)} /></div>
      </div>}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="workspace-topbar flex h-14 min-h-14 shrink-0 items-center gap-2 border-b bg-[var(--workspace-header)] px-4 py-1.5">
          <Button variant="ghost" size="icon" className="hidden size-8 md:inline-flex lg:hidden" onClick={() => setTabletSectionsOpen(true)} aria-label="Open sections"><PanelLeftOpen className="size-4" /></Button>
          {collapsed && <Button variant="ghost" size="icon" className="hidden size-8 lg:inline-flex" onClick={toggleCollapsed} aria-label="Show sections"><PanelLeftOpen className="size-4" /></Button>}
          {mobileHeader.leftAction && <div className="md:hidden">{mobileHeader.leftAction}</div>}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{pageTitle}</div>
            {mobileHeader.subtitle && <div className="truncate text-xs text-muted-foreground">{mobileHeader.subtitle}</div>}
          </div>
          {mobileHeader.rightAction && <div className="flex items-center gap-2">{mobileHeader.rightAction}</div>}
          <Button variant="outline" size="sm" className="md:hidden" onClick={openMobileNavigator} aria-label="Open workspace navigation">
            <PanelLeftOpen className="size-4" /><span className="hidden min-[380px]:inline">Menu</span>
          </Button>
        </header>

        <main className={cn("workspace-content min-h-0 flex-1 overflow-y-auto", isSocials && "p-0")}>
          {children}
        </main>
      </div>

      {mobileNavigatorOpen && <div className="fixed inset-0 z-[100] flex bg-background md:hidden">
        <CourseRail user={user} courses={courses} activeContext={browseContext} onSelect={setBrowseContext} reorderEnabled={mobileReorder} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="workspace-topbar flex h-14 min-h-14 items-center justify-between gap-2 border-b bg-[var(--workspace-header)] px-4 py-1.5">
            <Button variant={mobileReorder ? "secondary" : "ghost"} size="sm" onClick={() => setMobileReorder((value) => !value)}>
              {mobileReorder ? <RotateCcw className="size-4" /> : <ArrowUpDown className="size-4" />}{mobileReorder ? "Done" : "Reorder"}
            </Button>
            <Button variant="ghost" size="sm" onClick={closeMobileNavigator}>Close</Button>
          </div>
          <SectionSidebar
            context={browseContext}
            roles={user.roles}
            pathname={pathname}
            onNavigate={() => navigateFromMobile()}
          />
        </div>
      </div>}
    </div>
  )
}

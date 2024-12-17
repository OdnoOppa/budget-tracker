import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons"; // Radix UI-ийн иконнуудыг импортолно
import { Column } from "@tanstack/react-table"; // Танстакын таблицын баганы объект
import { cn } from "@/lib/utils"; // Бусад utility функцуудыг импортолдог
import { Button } from "@/components/ui/button"; // UI-ийн товчлуур
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Dropdown менюйн компонентууд

//  @author Erdenesuren

// Баганын даргын компонентын төрөл
interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>; // column объект
  title: string; // Баганы нэр
}

// Баганын даргын компонент
export function DataTableColumnHeader<TData, TValue>({
  column, // Багана
  title, // Баганы нэр
  className, // Синтетик CSS ангилал
}: DataTableColumnHeaderProps<TData, TValue>) {
  // Хэрэв тус баган дээр эрэмбэлэх боломжгүй бол энгийн текст харуулна
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  // Хэрэв эрэмбэлэх боломжтой бол Dropdown менүүг харуулна
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        {/* Dropdown-ыг дарахад товчлуурыг идэвхжүүлэх */}
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {/* Багана эрэмбэлэгдэж байгаа эсэхийг шалгаж, икон харуулах */}
            {column.getIsSorted() === "desc" ? (
              <ArrowDownIcon className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUpIcon className="ml-2 h-4 w-4" />
            ) : (
              <CaretSortIcon className="ml-2 h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {/* Эдгээр нь эрэмбэлэх үйлдлүүд */}
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Баганыг нууцлах үйлдэл */}
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

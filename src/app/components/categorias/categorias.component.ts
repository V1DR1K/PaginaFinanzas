import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { ToastrService } from 'ngx-toastr';
import { LayoutComponent } from '../layout/layout.component';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria, CategoriaRequest } from '../../modelos/categoria.model';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    LayoutComponent
  ],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.scss']
})
export class CategoriasComponent implements OnInit {
  categorias = signal<Categoria[]>([]);
  categoriasIngresos = signal<Categoria[]>([]);
  categoriasEgresos = signal<Categoria[]>([]);
  mostrandoFormulario = signal(false);
  editando = signal(false);
  categoriaForm: FormGroup;
  categoriaSeleccionada: Categoria | null = null;

  iconos = [
    'home', 'work', 'shopping_cart', 'restaurant', 'local_gas_station',
    'local_hospital', 'school', 'sports_esports', 'movie', 'fitness_center',
    'flight', 'hotel', 'directions_car', 'phone', 'computer', 'pets',
    'child_care', 'local_pharmacy', 'coffee', 'fastfood'
  ];

  colores = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722', '#795548', '#9E9E9E', '#607D8B'
  ];

  constructor(
    private categoriaService: CategoriaService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      tipo: ['egreso', Validators.required],
      icono: ['shopping_cart'],
      color: ['#F44336'],
      categoriaPadreId: [null]
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (data) => {
        this.categorias.set(data);
        this.categoriasIngresos.set(data.filter(c => c.tipo === 'ingreso' && !c.categoriaPadreId));
        this.categoriasEgresos.set(data.filter(c => c.tipo === 'egreso' && !c.categoriaPadreId));
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.toastr.error('Error al cargar las categorías', 'Error');
      }
    });
  }

  nuevaCategoria(): void {
    this.editando.set(false);
    this.categoriaSeleccionada = null;
    this.categoriaForm.reset({
      tipo: 'egreso',
      icono: 'shopping_cart',
      color: '#F44336'
    });
    this.mostrandoFormulario.set(true);
  }

  editarCategoria(categoria: Categoria): void {
    this.editando.set(true);
    this.categoriaSeleccionada = categoria;
    this.categoriaForm.patchValue({
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      icono: categoria.icono,
      color: categoria.color,
      categoriaPadreId: categoria.categoriaPadreId
    });
    this.mostrandoFormulario.set(true);
  }

  guardar(): void {
    if (this.categoriaForm.invalid) {
      this.toastr.warning('Por favor completa todos los campos', 'Formulario inválido');
      return;
    }

    const request: CategoriaRequest = this.categoriaForm.value;

    if (this.editando() && this.categoriaSeleccionada) {
      this.categoriaService.updateCategoria(this.categoriaSeleccionada.id, request).subscribe({
        next: () => {
          this.toastr.success('Categoría actualizada correctamente', 'Éxito');
          this.cargarCategorias();
          this.cancelar();
        },
        error: (error) => {
          console.error('Error al actualizar categoría:', error);
          this.toastr.error('Error al actualizar la categoría', 'Error');
        }
      });
    } else {
      this.categoriaService.createCategoria(request).subscribe({
        next: () => {
          this.toastr.success('Categoría creada correctamente', 'Éxito');
          this.cargarCategorias();
          this.cancelar();
        },
        error: (error) => {
          console.error('Error al crear categoría:', error);
          this.toastr.error('Error al crear la categoría', 'Error');
        }
      });
    }
  }

  eliminarCategoria(categoria: Categoria): void {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }

    this.categoriaService.deleteCategoria(categoria.id).subscribe({
      next: () => {
        this.toastr.success('Categoría eliminada correctamente', 'Éxito');
        this.cargarCategorias();
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        this.toastr.error('No se puede eliminar una categoría en uso', 'Error');
      }
    });
  }

  cancelar(): void {
    this.mostrandoFormulario.set(false);
    this.categoriaSeleccionada = null;
    this.categoriaForm.reset();
  }

  get categoriasParaSubcategoria(): Categoria[] {
    const tipo = this.categoriaForm.get('tipo')?.value;
    return this.categorias().filter(c => c.tipo === tipo && !c.categoriaPadreId);
  }
}

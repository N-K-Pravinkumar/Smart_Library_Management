import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Book } from '../../shared/models';

const SPINE: Record<string, string> = {
  Fiction:'#2a9d8f', 'Non-Fiction':'#c8a84b', Science:'#457b9d',
  Technology:'#6c757d', History:'#c1121f', 'Self-Help':'#e76f51',
  Biography:'#8338ec', Poetry:'#fb5607', Default:'#888'
};

const MOCK_BOOKS: Book[] = [
  { id:1, title:'Atomic Habits',         author:'James Clear',        isbn:'9780735211292', category:'Self-Help',   totalCopies:5, availableCopies:3, publishYear:2018 },
  { id:2, title:'The Alchemist',         author:'Paulo Coelho',       isbn:'9780061122415', category:'Fiction',     totalCopies:8, availableCopies:6, publishYear:1988 },
  { id:3, title:'Clean Code',            author:'Robert C. Martin',   isbn:'9780132350884', category:'Technology',  totalCopies:4, availableCopies:1, publishYear:2008 },
  { id:4, title:'Sapiens',              author:'Yuval Noah Harari',  isbn:'9780062316097', category:'History',     totalCopies:6, availableCopies:4, publishYear:2011 },
  { id:5, title:'The Midnight Library', author:'Matt Haig',          isbn:'9780525559474', category:'Fiction',     totalCopies:3, availableCopies:0, publishYear:2020 },
  { id:6, title:'Deep Work',            author:'Cal Newport',        isbn:'9781455586691', category:'Self-Help',   totalCopies:4, availableCopies:2, publishYear:2016 },
  { id:7, title:'A Brief History of Time', author:'Stephen Hawking', isbn:'9780553380163', category:'Science',     totalCopies:5, availableCopies:5, publishYear:1988 },
  { id:8, title:'Psychology of Money',  author:'Morgan Housel',      isbn:'9780857197689', category:'Non-Fiction', totalCopies:6, availableCopies:3, publishYear:2020 },
];
const CATEGORIES = ['All','Fiction','Non-Fiction','Science','Technology','History','Self-Help','Biography','Poetry'];

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page fade-up">
      <div class="page-header">
        <div>
          <h1 class="page-title">Books Catalogue</h1>
          <p class="page-subtitle">{{ books().length }} titles in collection</p>
        </div>
        <button class="btn btn--gold" (click)="openModal()">+ Add Book</button>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="field toolbar__search">
          <div class="field__wrap">
            <span class="field__icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </span>
            <input class="field__input field__input--icon" placeholder="Search title, author, ISBN…"
              [(ngModel)]="search" (ngModelChange)="filterBooks()" />
          </div>
        </div>
        <div class="cat-pills">
          @for (cat of categories; track cat) {
            <button class="cat-pill" [class.cat-pill--active]="activeCategory()===cat"
              (click)="setCategory(cat)">{{ cat }}</button>
          }
        </div>
        <div class="view-toggle">
          <button class="view-btn" [class.view-btn--active]="view()==='grid'" (click)="setView('grid')">⊞</button>
          <button class="view-btn" [class.view-btn--active]="view()==='table'" (click)="setView('table')">☰</button>
        </div>
      </div>

      <!-- Grid View -->
      @if (view() === 'grid') {
        @if (filtered().length === 0) {
          <div class="empty-state">
            <div class="empty-state__icon">📚</div>
            <h3 class="empty-state__title">No books found</h3>
            <p class="empty-state__desc">Try a different search or category</p>
            <button class="btn btn--gold" (click)="clearFilters()">Clear filters</button>
          </div>
        } @else {
          <div class="books-grid">
            @for (book of filtered(); track book.id) {
              <div class="book-card">
                <div class="book-card__spine" [style.background]="spineColor(book.category)"></div>
                <div class="book-card__body">
                  <span class="badge" [class]="book.availableCopies > 0 ? 'badge--success' : 'badge--danger'">
                    {{ book.availableCopies > 0 ? book.availableCopies + ' available' : 'Unavailable' }}
                  </span>
                  <h3 class="book-card__title">{{ book.title }}</h3>
                  <p class="book-card__author">{{ book.author }}</p>
                  <div class="book-card__meta">
                    <span class="badge badge--default">{{ book.category }}</span>
                    <span class="book-card__year">{{ book.publishYear }}</span>
                  </div>
                  <div class="copies-wrap">
                    <div class="copies-bar">
                      @for (seg of copiesArr(book); track $index) {
                        <div class="copies-seg" [class.copies-seg--avail]="seg < book.availableCopies"></div>
                      }
                    </div>
                    <span class="copies-text">{{ book.availableCopies }}/{{ book.totalCopies }} copies</span>
                  </div>
                  <div class="book-card__actions">
                    <button class="btn btn--outline btn--sm" (click)="openModal(book)">Edit</button>
                    <button class="btn btn--ghost btn--sm" (click)="confirmDelete(book)">Delete</button>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }

      <!-- Table View -->
      @if (view() === 'table') {
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr>
              <th>Title</th><th>Author</th><th>ISBN</th><th>Category</th>
              <th>Total</th><th>Available</th><th>Year</th><th>Actions</th>
            </tr></thead>
            <tbody>
              @for (book of filtered(); track book.id) {
                <tr>
                  <td><strong>{{ book.title }}</strong></td>
                  <td>{{ book.author }}</td>
                  <td><span class="text-mono" style="font-size:12px">{{ book.isbn }}</span></td>
                  <td><span class="badge badge--default">{{ book.category }}</span></td>
                  <td>{{ book.totalCopies }}</td>
                  <td><span class="badge" [class]="book.availableCopies>0?'badge--success':'badge--danger'">{{ book.availableCopies }}</span></td>
                  <td>{{ book.publishYear }}</td>
                  <td>
                    <div style="display:flex;gap:6px">
                      <button class="btn btn--outline btn--sm" (click)="openModal(book)">Edit</button>
                      <button class="btn btn--ghost btn--sm" (click)="confirmDelete(book)">Del</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Add/Edit Modal -->
    @if (showModal()) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal modal--lg" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">{{ editingBook() ? 'Edit Book' : 'Add New Book' }}</h3>
            <button class="modal__close" (click)="closeModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <div class="form-grid">
              <div class="field form-grid__span2">
                <label class="field__label">Title *</label>
                <input class="field__input" [(ngModel)]="form.title" placeholder="Book title" />
              </div>
              <div class="field">
                <label class="field__label">Author *</label>
                <input class="field__input" [(ngModel)]="form.author" placeholder="Author name" />
              </div>
              <div class="field">
                <label class="field__label">ISBN</label>
                <input class="field__input" [(ngModel)]="form.isbn" placeholder="978-..." />
              </div>
              <div class="field">
                <label class="field__label">Category</label>
                <select class="field__input" [(ngModel)]="form.category">
                  @for (cat of categories.slice(1); track cat) { <option>{{ cat }}</option> }
                </select>
              </div>
              <div class="field">
                <label class="field__label">Publish Year</label>
                <input class="field__input" type="number" [(ngModel)]="form.publishYear" />
              </div>
              <div class="field">
                <label class="field__label">Total Copies</label>
                <input class="field__input" type="number" [(ngModel)]="form.totalCopies" min="1" />
              </div>
              <div class="field form-grid__span2">
                <label class="field__label">Description</label>
                <textarea class="field__input" style="min-height:80px;resize:vertical" [(ngModel)]="form.description" placeholder="Optional description…"></textarea>
              </div>
            </div>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" (click)="closeModal()">Cancel</button>
            <button class="btn btn--gold" (click)="saveBook()" [disabled]="saving()">
              {{ saving() ? 'Saving…' : (editingBook() ? 'Save Changes' : 'Add Book') }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirm -->
    @if (deleteTarget()) {
      <div class="modal-overlay" (click)="closeDeleteModal()">
        <div class="modal modal--sm" (click)="$event.stopPropagation()">
          <div class="modal__header">
            <h3 class="modal__title">Delete Book</h3>
            <button class="modal__close" (click)="closeDeleteModal()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="modal__body">
            <p style="color:var(--ink-40)">Delete <strong>"{{ deleteTarget()!.title }}"</strong>? This cannot be undone.</p>
          </div>
          <div class="modal__footer">
            <button class="btn btn--outline" (click)="closeDeleteModal()">Cancel</button>
            <button class="btn btn--danger" (click)="doDelete()">Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .toolbar { display:flex; gap:14px; align-items:center; margin-bottom:24px; flex-wrap:wrap; }
    .toolbar__search { width:280px; flex-shrink:0; margin-bottom:0; }

    .cat-pills { display:flex; gap:6px; flex-wrap:wrap; flex:1; }
    .cat-pill {
      padding:6px 14px; border-radius:100px; font-size:13px; font-weight:500;
      border:1.5px solid var(--ink-10); background:transparent; cursor:pointer;
      color:var(--ink-40); transition:all var(--transition); white-space:nowrap;
    }
    .cat-pill:hover { border-color:var(--ink-40); color:var(--ink); }
    .cat-pill--active { background:var(--ink); color:var(--paper); border-color:var(--ink); }

    .view-toggle { display:flex; border:1.5px solid var(--ink-10); border-radius:10px; overflow:hidden; }
    .view-btn { padding:7px 12px; background:none; border:none; cursor:pointer; font-size:16px; color:var(--ink-40); transition:all var(--transition); }
    .view-btn--active { background:var(--ink); color:var(--paper); }

    .books-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:20px; }
    .book-card { background:white; border-radius:var(--r-lg); border:1px solid var(--ink-05); overflow:hidden; display:flex; transition:all var(--transition); }
    .book-card:hover { box-shadow:var(--shadow-md); transform:translateY(-3px); }
    .book-card__spine { width:8px; flex-shrink:0; }
    .book-card__body { padding:18px; flex:1; display:flex; flex-direction:column; gap:8px; }
    .book-card__title { font-family:var(--font-display); font-size:15px; font-weight:600; line-height:1.3; margin-top:4px; }
    .book-card__author { font-size:13px; color:var(--ink-40); }
    .book-card__meta { display:flex; align-items:center; justify-content:space-between; }
    .book-card__year { font-size:12px; color:var(--ink-20); font-family:var(--font-mono); }
    .book-card__actions { display:flex; gap:8px; margin-top:4px; }

    .copies-wrap { }
    .copies-bar { display:flex; gap:3px; margin-bottom:4px; }
    .copies-seg { height:4px; flex:1; border-radius:2px; background:var(--ink-10); }
    .copies-seg--avail { background:var(--teal); }
    .copies-text { font-size:11px; color:var(--ink-40); }

    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .form-grid__span2 { grid-column:span 2; }
  `]
})
export class BooksComponent implements OnInit {
  private api   = inject(ApiService);
  private toast = inject(ToastService);

  books          = signal<Book[]>(MOCK_BOOKS);
  filtered       = signal<Book[]>(MOCK_BOOKS);
  showModal      = signal(false);
  editingBook    = signal<Book | null>(null);
  deleteTarget   = signal<Book | null>(null);
  saving         = signal(false);
  view           = signal<'grid'|'table'>('grid');
  activeCategory = signal('All');
  search         = '';
  categories     = CATEGORIES;

  form: Partial<Book> & { description?: string } = {};

  ngOnInit() {
    // this.api.getBooks().subscribe(res => { this.books.set(res.content); this.filtered.set(res.content); });
  }

  filterBooks() {
    const s = this.search.toLowerCase();
    const cat = this.activeCategory();
    this.filtered.set(this.books().filter(b =>
      (cat === 'All' || b.category === cat) &&
      (!s || b.title.toLowerCase().includes(s) || b.author.toLowerCase().includes(s) || b.isbn.includes(s))
    ));
  }

  clearFilters() { this.search = ''; this.activeCategory.set('All'); this.filterBooks(); }

  setCategory(cat: string) { this.activeCategory.set(cat); this.filterBooks(); }
  setView(v: 'grid' | 'table') { this.view.set(v); }

  openModal(book?: Book) {
    this.editingBook.set(book ?? null);
    this.form = book ? { ...book } : { title:'', author:'', isbn:'', category:'Fiction', publishYear: new Date().getFullYear(), totalCopies:1 };
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.editingBook.set(null); }

  saveBook() {
    if (!this.form.title || !this.form.author) { this.toast.warn('Title and author are required.'); return; }
    this.saving.set(true);
    setTimeout(() => {  // Simulate API call
      if (this.editingBook()) {
        this.books.update(bs => bs.map(b => b.id === this.editingBook()!.id ? { ...b, ...this.form } as Book : b));
        this.toast.success('Book updated successfully!');
      } else {
        const newBook: Book = { ...this.form as Book, id: Date.now(), availableCopies: this.form.totalCopies! };
        this.books.update(bs => [newBook, ...bs]);
        this.toast.success('Book added to catalogue!');
      }
      this.filterBooks();
      this.saving.set(false);
      this.closeModal();
    }, 600);
  }

  closeDeleteModal(): void { this.deleteTarget.set(null); }
  confirmDelete(book: Book) { this.deleteTarget.set(book); }

  doDelete() {
    const id = this.deleteTarget()!.id;
    this.books.update(bs => bs.filter(b => b.id !== id));
    this.filterBooks();
    this.toast.success('Book deleted.');
    this.deleteTarget.set(null);
  }

  spineColor(cat: string) { return SPINE[cat] || SPINE['Default']; }
  copiesArr(book: Book) { return Array.from({ length: book.totalCopies }, (_, i) => i); }
}

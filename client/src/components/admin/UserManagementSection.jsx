import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../../services/api.js';
import { updateUserRoleBodySchema } from 'meshdesk-shared';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  SortableHeader,
  TablePagination,
  MobileCardList,
  MobileCard,
} from '../ui/Table.jsx';
import { TableSkeleton, UserCardSkeleton } from '../ui/Skeleton.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Select } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import { ConfirmDialog } from './ConfirmDialog.jsx';

const SORT_COLUMNS = [
  { key: 'username', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'lastLoginAt', label: 'Last login' },
  { key: 'createdAt', label: 'Created' },
];

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export function UserManagementSection() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);

  const roleForm = useForm({
    resolver: zodResolver(updateUserRoleBodySchema),
    defaultValues: { role: 'user' },
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminListUsers({ page, limit: 20, search, sort, order });
      setUsers(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setSelected([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, order]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const toggleSort = (column) => {
    if (sort === column) {
      setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(column);
      setOrder('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selected.length === users.length) {
      setSelected([]);
    } else {
      setSelected(users.map((u) => u.id));
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const runConfirmedAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      if (confirm.type === 'suspend') {
        await api.adminUpdateUserStatus(confirm.userId, false);
      } else if (confirm.type === 'reactivate') {
        await api.adminUpdateUserStatus(confirm.userId, true);
      } else if (confirm.type === 'reset') {
        await api.adminForcePasswordReset(confirm.userId);
      } else if (confirm.type === 'bulk-suspend') {
        await api.adminBulkUpdateUserStatus(selected, false);
      } else if (confirm.type === 'bulk-reactivate') {
        await api.adminBulkUpdateUserStatus(selected, true);
      } else if (confirm.type === 'role') {
        await api.adminUpdateUserRole(confirm.userId, confirm.role);
      }
      setConfirm(null);
      await loadUsers();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleChange = (user) => {
    setRoleTarget(user);
    roleForm.reset({ role: user.role });
  };

  const submitRoleChange = roleForm.handleSubmit(({ role }) => {
    if (!roleTarget || role === roleTarget.role) {
      setRoleTarget(null);
      return;
    }
    setConfirm({
      type: 'role',
      userId: roleTarget.id,
      role,
      title: `Change role for ${roleTarget.username}?`,
      description: `Role will change from ${roleTarget.role} to ${role}.`,
    });
    setRoleTarget(null);
  });

  const viewStats = async (userId) => {
    try {
      const data = await api.adminGetUserStats(userId);
      setStats(data);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-heading text-ink">User management</h2>
          <p className="text-sm text-ink-muted">{total} users total</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selected.length > 0 ? (
            <>
              <span className="text-meta text-ink-muted">{selected.length} selected</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setConfirm({
                    type: 'bulk-suspend',
                    title: 'Suspend selected users?',
                    description: `${selected.length} user(s) will be suspended and signed out.`,
                  })
                }
              >
                Bulk suspend
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setConfirm({
                    type: 'bulk-reactivate',
                    title: 'Reactivate selected users?',
                    description: `${selected.length} user(s) will be reactivated.`,
                  })
                }
              >
                Bulk reactivate
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="max-w-md">
        <Input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by name or email…"
          aria-label="Search users"
        />
      </div>

      {error && <p className="text-sm text-danger" role="alert">{error}</p>}

      {loading ? (
        <>
          <div className="hidden md:block">
            <TableSkeleton rows={6} cols={6} />
          </div>
          <UserCardSkeleton />
        </>
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHead>
                <tr>
                  <TableCell header className="w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all users"
                      checked={users.length > 0 && selected.length === users.length}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  {SORT_COLUMNS.map((col) => (
                    <TableCell key={col.key} header>
                      <SortableHeader
                        label={col.label}
                        column={col.key}
                        sort={sort}
                        order={order}
                        onSort={toggleSort}
                      />
                    </TableCell>
                  ))}
                  <TableCell header>Status</TableCell>
                  <TableCell header>Actions</TableCell>
                </tr>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Select ${user.username}`}
                        checked={selected.includes(user.id)}
                        onChange={() => toggleSelect(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-ink">{user.username}</TableCell>
                    <TableCell className="text-ink-muted">{user.email}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="secondary" onClick={() => openRoleChange(user)}>
                        {user.role}
                      </Button>
                    </TableCell>
                    <TableCell className="text-ink-muted">{formatDate(user.lastLoginAt)}</TableCell>
                    <TableCell className="text-ink-muted">{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.isActive
                            ? 'bg-success-muted text-success'
                            : 'bg-danger-muted text-danger'
                        }`}
                      >
                        {user.isActive ? 'active' : 'suspended'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Button size="sm" variant="secondary" onClick={() => viewStats(user.id)}>
                          Stats
                        </Button>
                        {user.isActive ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              setConfirm({
                                type: 'suspend',
                                userId: user.id,
                                title: `Suspend ${user.username}?`,
                                description: 'They will be signed out and unable to log in.',
                              })
                            }
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              setConfirm({
                                type: 'reactivate',
                                userId: user.id,
                                title: `Reactivate ${user.username}?`,
                                description: 'They will be able to sign in again.',
                              })
                            }
                          >
                            Reactivate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setConfirm({
                              type: 'reset',
                              userId: user.id,
                              title: `Force password reset for ${user.username}?`,
                              description:
                                'Sessions will be invalidated and a reset email will be sent.',
                            })
                          }
                        >
                          Reset password
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <MobileCardList>
            {users.map((user) => (
              <MobileCard key={user.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{user.username}</p>
                    <p className="text-xs text-ink-muted">{user.email}</p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label={`Select ${user.username}`}
                    checked={selected.includes(user.id)}
                    onChange={() => toggleSelect(user.id)}
                  />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-ink-subtle">Role</dt>
                    <dd className="text-ink">{user.role}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-subtle">Status</dt>
                    <dd>{user.isActive ? 'active' : 'suspended'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-ink-subtle">Last login</dt>
                    <dd className="text-ink-muted">{formatDate(user.lastLoginAt)}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Button size="sm" variant="secondary" onClick={() => openRoleChange(user)}>
                    Role
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => viewStats(user.id)}>
                    Stats
                  </Button>
                  {user.isActive ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setConfirm({
                          type: 'suspend',
                          userId: user.id,
                          title: `Suspend ${user.username}?`,
                          description: 'They will be signed out and unable to log in.',
                        })
                      }
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setConfirm({
                          type: 'reactivate',
                          userId: user.id,
                          title: `Reactivate ${user.username}?`,
                          description: 'They will be able to sign in again.',
                        })
                      }
                    >
                      Reactivate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setConfirm({
                        type: 'reset',
                        userId: user.id,
                        title: `Force password reset for ${user.username}?`,
                        description: 'Sessions will be invalidated and a reset email will be sent.',
                      })
                    }
                  >
                    Reset password
                  </Button>
                </div>
              </MobileCard>
            ))}
          </MobileCardList>
        </>
      )}

      <TablePagination
        page={page}
        totalPages={totalPages}
        total={total}
        onPrevious={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />

      <Modal
        open={Boolean(stats)}
        onClose={() => setStats(null)}
        title={stats?.user.username}
        description={stats?.user.email}
        footer={
          <Button size="sm" onClick={() => setStats(null)}>
            Close
          </Button>
        }
      >
        {stats ? (
          <ul className="space-y-2 text-sm text-ink">
            <li>AI conversations: {stats.stats.aiConversationCount}</li>
            <li>Group conversations: {stats.stats.groupConversationCount}</li>
          </ul>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(roleTarget)}
        onClose={() => setRoleTarget(null)}
        title="Change role"
        description={roleTarget?.username}
        size="sm"
      >
        <form onSubmit={submitRoleChange} className="space-y-4">
          <FormField label="Role" error={roleForm.formState.errors.role?.message}>
            <Select
              hasError={Boolean(roleForm.formState.errors.role)}
              {...roleForm.register('role')}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </Select>
          </FormField>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setRoleTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Continue
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={
          confirm?.type === 'reset'
            ? 'Send reset'
            : confirm?.type === 'role'
              ? 'Change role'
              : confirm?.type?.includes('suspend')
                ? 'Suspend'
                : 'Confirm'
        }
        loading={actionLoading}
        onCancel={() => setConfirm(null)}
        onConfirm={runConfirmedAction}
      />
    </section>
  );
}

// src/components/Dashboard/Home/index.jsx
import {
  faFileAlt,
  faFileAudio,
  faFileImage,
  faFileVideo,
  faFolder,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  getAdminFiles,
  getAdminFolders,
  getSharedFiles,
  getSharedFolders,
  selectItem,
  selectFolder,
  deselectAll,
  deselectItem,
} from '../../../redux/actionCreators/filefoldersActionCreators.js';
import SubNav from '../SubNav.js/index.jsx';
import SearchBar from '../../SearchBar/index.jsx';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    isLoading,
    adminFolders,
    allUserFolders,
    allUserFiles,
    userId,
    selectedItems,
  } = useSelector(
    (state) => ({
      isLoading: state.filefolders.isLoading,
      adminFolders: state.filefolders.adminFolders,
      allUserFolders: state.filefolders.userFolders,
      allUserFiles: state.filefolders.userFiles,
      userId: state.auth.userId,
      selectedItems: state.filefolders.selectedItems,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (isLoading) {
      dispatch(getAdminFolders());
      dispatch(getAdminFiles());
    }
    if (!allUserFolders) {
      dispatch(getSharedFiles());
      dispatch(getSharedFolders());
    }
  }, [dispatch, isLoading, allUserFolders, userId]);

  if (isLoading) {
    return (
      <Row>
        <Col>
          <h1 className="text-center my-5">Loading...</h1>
        </Col>
      </Row>
    );
  }

  // derive root-level folders
  const userFolders = allUserFolders?.filter((f) => f.data.parent === '');

  // for non-search display
  const createdFiles = allUserFiles?.filter(
    (f) => f.data.parent === '' && !f.data.url
  );
  const uploadedFiles = allUserFiles?.filter(
    (f) => f.data.parent === '' && f.data.url
  );

  // breadcrumbs
  const fileBreadcrumb = (file) =>
    (file.data.path || []).map((p) => p.name).join(' / ') || 'root';
  const folderBreadcrumb = (folder) =>
    (folder.data.path || []).map((p) => p.name).join(' / ') || 'root';

  // search matches
  const matches =
    searchTerm.length >= 3
      ? allUserFiles.filter((f) =>
          f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];
  const folderMatches =
    searchTerm.length >= 3
      ? [...adminFolders, ...allUserFolders].filter((f) =>
          f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const isItemSelected = (docId) =>
    !!selectedItems.find((item) => item.docId === docId);

  const openInFolder = (file) => {
    dispatch(deselectAll());
    const p = file.data.path || [];
    const parentId = p.length ? p[p.length - 1].id : '';
    history.push(parentId ? `/dashboard/folder/${parentId}` : '/dashboard');
    dispatch(selectItem({ docId: file.docId, data: file.data, type: 'file' }));
    setSearchTerm('');
  };

  const toggleSelect = (docId, data, type = 'folder') => {
    if (isItemSelected(docId)) {
      dispatch(deselectItem({ docId }));
    } else {
      if (type === 'folder') dispatch(selectFolder({ docId, data }));
      else dispatch(selectItem({ docId, data, type: 'file' }));
    }
  };

  const changeRoute = (url) => {
    dispatch(deselectAll());
    history.push(url);
  };

  return (
    <>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      {searchTerm.length >= 3 && (
        <div className="search-results px-5">
          {/* FOLDERS */}
          <p className="text-center border-bottom py-2">
            <strong>Folders</strong>
          </p>
          {folderMatches.length > 0 ? (
            folderMatches.map(({ data, docId }) => {
              // on folder-click: navigate to parent and select this folder
              const path = data.path || [];
              const parentId = path.length ? path[path.length - 1].id : '';
              return (
                <div
                  key={docId}
                  className="search-item py-1 border-bottom"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    dispatch(deselectAll());
                    history.push(
                      parentId
                        ? `/dashboard/folder/${parentId}`
                        : '/dashboard'
                    );
                    dispatch(selectFolder({ docId, data }));
                    setSearchTerm('');
                  }}
                >
                  <FontAwesomeIcon icon={faFolder} />{' '}
                  <strong>{data.name}</strong>
                  <small className="text-muted">
                    {' '}— {folderBreadcrumb({ data, docId })}
                  </small>
                </div>
              );
            })
          ) : (
            <div className="text-muted px-2 py-1">No matching items :/</div>
          )}

          {/* FILES */}
          {matches.length > 0 && (
            <>
              <p className="text-center border-bottom py-2">
                <strong>Files</strong>
              </p>
              {matches.map((file) => (
                <div
                  key={file.docId}
                  className="search-item py-1 border-bottom"
                  style={{ cursor: 'pointer' }}
                  onClick={() => openInFolder(file)}
                >
                  <strong>{file.data.name}</strong>
                  <small className="text-muted">
                    {' '}— {fileBreadcrumb(file)}
                  </small>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <SubNav currentFolder="root folder" />

      {/* Admin Folders */}
      {adminFolders?.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Admin Folders</p>
          <Row className="pt-2 pb-4 px-5" style={{ height: 150 }}>
            {adminFolders.map(({ data, docId }) => (
              <Col
                key={docId}
                md={2}
                onDoubleClick={() =>
                  history.push(`/dashboard/folder/admin/${docId}`)
                }
                onClick={() => toggleSelect(docId, data, 'folder')}
                className={`border h-100 d-flex flex-column align-items-center justify-content-center rounded-2 py-1
                  ${isItemSelected(docId) ? 'selected-item text-white shadow-sm' : ''}`}
              >
                <FontAwesomeIcon icon={faFolder} size="3x" />
                <p className="mt-2">{data.name}</p>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* User Folders */}
      {userFolders?.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Shared Folders</p>
          <Row className="pt-2 gap-2 pb-4 px-5">
            {userFolders.map(({ data, docId }) => (
              <Col
                key={docId}
                md={2}
                onDoubleClick={() => changeRoute(`/dashboard/folder/${docId}`)}
                onClick={() => toggleSelect(docId, data, 'folder')}
                className={`border h-100 d-flex flex-column align-items-center justify-content-center rounded-2 py-1
                  ${isItemSelected(docId) ? 'selected-item text-white shadow-sm' : ''}`}
              >
                <FontAwesomeIcon icon={faFolder} size="3x" />
                <p className="mt-2">{data.name}</p>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Created Files */}
      {createdFiles?.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Shared Files</p>
          <Row className="pt-2 gap-2 pb-4 px-5">
            {createdFiles.map(({ data, docId }) => (
              <Col
                key={docId}
                md={2}
                onDoubleClick={() => changeRoute(`/dashboard/file/${docId}`)}
                onClick={() => toggleSelect(docId, data, 'file')}
                className={`border h-100 d-flex flex-column align-items-center justify-content-center rounded-2 py-1
                  ${isItemSelected(docId) ? 'selected-item text-white shadow-sm' : ''}`}
              >
                <FontAwesomeIcon icon={faFileAlt} size="3x" />
                <p className="mt-2">{data.name}</p>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Uploaded Files */}
      {uploadedFiles?.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Uploaded Files</p>
          <Row className="pt-2 gap-2 pb-4 px-5">
            {uploadedFiles.map(({ data, docId }) => (
              <Col
                key={docId}
                md={2}
                onDoubleClick={() => changeRoute(`/dashboard/file/${docId}`)}
                onClick={() => toggleSelect(docId, data, 'file')}
                className={`border h-100 d-flex flex-column align-items-center justify-content-center rounded-2 py-1
                  ${isItemSelected(docId) ? 'selected-item text-white shadow-sm' : ''}`}
              >
                <FontAwesomeIcon
                  icon={
                    data.name.match(/\.(png|jpe?g|svg|gif)$/)
                      ? faFileImage
                      : data.name.match(/\.(mp4|mpeg|webm)$/)
                      ? faFileVideo
                      : data.name.endsWith('.mp3')
                      ? faFileAudio
                      : faFileAlt
                  }
                  size="3x"
                />
                <p className="mt-2">{data.name}</p>
              </Col>
            ))}
          </Row>
        </>
      )}

      {!(adminFolders?.length || userFolders?.length || createdFiles?.length || uploadedFiles?.length) && (
        <Row>
          <Col>
            <p className="text-center my-5">No items to display.</p>
          </Col>
        </Row>
      )}
    </>
  );
};

export default Home;
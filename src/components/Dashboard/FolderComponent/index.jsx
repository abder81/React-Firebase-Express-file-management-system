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
import { useHistory, useParams } from 'react-router-dom';
import {
  getAdminFiles,
  getAdminFolders,
  getUserFiles,
  getUserFolders,
  selectItem,
  selectFolder,
  deselectAll,
  deselectItem,
} from '../../../redux/actionCreators/filefoldersActionCreators.js';
import SubNav from '../SubNav.js/index.jsx';
import SearchBar from '../../SearchBar/index.jsx';

const FolderComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { folderId } = useParams();
  const dispatch = useDispatch();
  const history = useHistory();

  const {
    folders,
    files,
    isLoading,
    userId,
    selectedItems,
  } = useSelector(
    (state) => ({
      folders: state.filefolders.userFolders,
      files: state.filefolders.userFiles, // corrected typo
      isLoading: state.filefolders.isLoading,
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
    if (!folders || !files) {
      dispatch(getUserFolders(userId));
      dispatch(getUserFiles(userId));
    }
  }, [dispatch, folders, files, isLoading, userId]);

  if (isLoading) {
    return (
      <Row>
        <Col>
          <h1 className="text-center my-5">Loading...</h1>
        </Col>
      </Row>
    );
  }

  // derive direct sub-folders and files, guard against undefined
  const userFolders = (folders || []).filter((f) => f.data.parent === folderId);
  const createdFiles = (files   || []).filter(
    (f) => f.data.parent === folderId && !f.data.url
  );
  const uploadedFiles = (files   || []).filter(
    (f) => f.data.parent === folderId && f.data.url
  );

  // filter when searching
  const filteredCreated =
    searchTerm.length >= 3
      ? createdFiles.filter((f) =>
          f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : createdFiles;
  const filteredUploaded =
    searchTerm.length >= 3
      ? uploadedFiles.filter((f) =>
          f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : uploadedFiles;

  // search across descendants
  const allDescendantFiles = (files || []).filter((f) =>
    [f.data.parent, ...(f.data.path || []).map((p) => p.id)].includes(folderId)
  );

  // matches for search panel
  const folderMatches =
    searchTerm.length >= 3
      ? userFolders.filter((f) =>
          f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];
  const fileMatches =
    searchTerm.length >= 3
      ? allDescendantFiles.filter((f) =>
          f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  // breadcrumbs
  const fileBreadcrumb = (file) =>
    [...(file.data.path || []).map((p) => p.name), file.data.name].join(' / ');
  const folderBreadcrumb = (folder) =>
    (folder.data.path || []).map((p) => p.name).join(' / ') || 'root';

  // selection helpers
  const isItemSelected = (docId) =>
    !!selectedItems.find((i) => i.docId === docId);
  const toggleSelect = (docId, data, type = 'folder') => {
    if (isItemSelected(docId)) {
      dispatch(deselectItem({ docId }));
    } else {
      if (type === 'folder') dispatch(selectFolder({ docId, data }));
      else dispatch(selectItem({ docId, data, type: 'file' }));
    }
  };

  // navigation helper
  const changeRoute = (url) => {
    dispatch(deselectAll());
    history.push(url);
    setSearchTerm('');
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
          {fileMatches.length > 0 && (
            <>
              <p className="text-center border-bottom py-2">
                <strong>Files</strong>
              </p>
              {fileMatches.map((file) => (
                <div
                  key={file.docId}
                  className="search-item py-1 border-bottom"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    dispatch(deselectAll());
                    const p = file.data.path || [];
                    const parentId = p.length ? p[p.length - 1].id : '';
                    history.push(
                      parentId
                        ? `/dashboard/folder/${parentId}`
                        : '/dashboard'
                    );
                    dispatch(selectItem({ docId: file.docId, data: file.data, type: 'file' }));
                    setSearchTerm('');
                  }}
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

      <SubNav currentFolder={folders.find((f) => f.docId === folderId)} />

      {/* Sub-Folders */}
      {userFolders.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Sub-Folders</p>
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
      {filteredCreated.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Created Files</p>
          <Row className="pt-2 gap-2 pb-4 px-5">
            {filteredCreated.map(({ data, docId }) => (
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
      {filteredUploaded.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Uploaded Files</p>
          <Row className="pt-2 gap-2 pb-4 px-5">
            {filteredUploaded.map(({ data, docId }) => (
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
                  size="3x" />
                <p className="mt-2">{data.name}</p>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Empty State */}
      {!userFolders.length && !filteredCreated.length && !filteredUploaded.length && (
        <Row>
          <Col>
            <p className="text-center my-5">Empty Folder</p>
          </Col>
        </Row>
      )}
    </>
  );
};

export default FolderComponent;
